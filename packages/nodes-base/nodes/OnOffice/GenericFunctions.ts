import {
	ICredentialDataDecryptedObject,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	INode,
	JsonObject,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

import { OptionsWithUri } from 'request';

import { createHash } from 'crypto';
import {
	OnOfficeAction,
	OnOfficeActionRequest,
	OnOfficeActionResponse,
	OnOfficeActionResponseSuccess,
	OnOfficeFieldConfiguration,
	OnOfficeReadFilterConfiguration,
	OnOfficeResource,
	OnOfficeResponse,
	OnOfficeResponseRecord,
	OnOfficeResponseSuccess,
} from './interfaces';

const md5 = (str: string) => {
	return createHash('md5').update(str).digest('hex');
};

const unicodeEscape = (text: string) =>
	text.replace(/[\s\S]/g, (character) =>
		character.charCodeAt(0) < 128
			? character
			: '\\u' + ('0000' + character.charCodeAt(0).toString(16)).slice(-4),
	);

const assertSuccessfulResponse: <ElementType>(
	responseData: OnOfficeResponse<ElementType>,
	node: INode,
) => asserts responseData is OnOfficeResponseSuccess<ElementType> = (responseData, node) => {
	if (responseData.status.code !== 200) {
		throw new NodeApiError(node, responseData as unknown as JsonObject, {
			httpCode: responseData.status.code === 400 ? '401' : responseData.status.code + '',
			description: responseData.status.message + ' ',
			message:
				responseData.status.code === 400
					? 'Authorization failed - please check your credentials'
					: responseData.status.code === 500
						? 'The service failed to process your request'
						: 'Your request is invalid or could not be processed by the service',
		});
	}
};

const assertSuccessfulActionResponses: <ElementType>(
	actions: Array<OnOfficeActionResponse<ElementType> | undefined>,
	node: INode,
) => asserts actions is Array<OnOfficeActionResponseSuccess<ElementType>> = (actions, node) => {
	const filteredActions = actions.flatMap(action => action ? [action] : []);
	filteredActions.forEach((action) => {
		if (action.status.errorcode !== 0) {
			throw new NodeApiError(node, action as unknown as JsonObject, {
				httpCode: '500',
				description: action.status.message,
				message: 'The service failed to process your request',
			});
		}
	});
	if (filteredActions.length === 0) {
		throw new NodeOperationError(node, 'The server did not send a response for any action');
	}
};

/** Call the onOffice API with multiple actions */
export async function onOfficeApiCall<
	ElementType = Record<string, unknown> | Array<Record<string, unknown>>,
	>(
		that: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
		actions: OnOfficeActionRequest[],
) {
	const node = that.getNode();
	const request = that.helpers.request;
	if (!request) {
		throw new Error('No request function. This should not happen.');
	}
	const credentials = (await that.getCredentials('onOfficeApi')) as ICredentialDataDecryptedObject;
	const apiToken = credentials.apiToken as string;

	const body = {
		token: apiToken,
		request: {
			actions,
		},
	};

	const options: OptionsWithUri = {
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'n8n-onoffice',
		},
		method: 'POST',
		body,
		uri: 'https://api.onoffice.de/api/latest/api.php',
		json: true,
	};

	const responseData = (await request(options).catch((error: JsonObject) => {
		throw new NodeApiError(node, error);
	})) as OnOfficeResponse<ElementType>;

	return responseData;
}

/** Call the onOffice API with a single action */
export function createActionRequest(
	apiSecret: string,
	apiToken: string,
	actionType: OnOfficeAction,
	resourceType: OnOfficeResource,
	parameters: Record<string, unknown>,
	resourceid = '',
	identifier = '',
) {
	const resourcetype = resourceType;
	const timestamp = Math.floor(Date.now() / 1000) + '';
	const actionid = `urn:onoffice-de-ns:smart:2.5:smartml:action:${actionType}`;

	const sortedParameters = Object.keys(parameters).length
		? Object.fromEntries(Object.entries(parameters).sort())
		: { a: null };

	console.log('Parameters: ', JSON.stringify(sortedParameters));

	const hmac = md5(
		apiSecret +
		md5(
			`${unicodeEscape(
				JSON.stringify(sortedParameters).replace('/', '\\/'),
			)},${apiToken},${actionid},${identifier},${resourceid},${apiSecret},${timestamp},${resourceType}`,
		),
	);

	const action = {
		actionid,
		identifier,
		resourcetype,
		resourceid,
		parameters: sortedParameters,
		timestamp,
		hmac,
	};

	return action;
}

export class OnOfficeRequestBatch {
	/** A n8n object */
	that;
	/** All currently queued up actions */
	actions: Array<OnOfficeActionRequest | undefined>;
	/** A promise that will be resolved, once results are available */
	resultPromise: Promise<void>;
	resolve: () => void;
	reject: (error: Error) => void;
	/** Will be populated before resultPromise resolves. */
	result?: Record<string, OnOfficeActionResponse<Record<string, unknown> | Array<Record<string, unknown>>>>;
	/** Automatically process all requests once expectedRequests are queued up */
	maxQueue: number;
	/** How many requests are currently queued up */
	queueLength: number;
	/** This promis is pending, while the call is running, so no new calls are made. */
	readyPromise: Promise<void>;
	/** Currently blocking */
	blocking: boolean;

	constructor(that: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
		/** Automatically process all requests once maxQueue are queued up */
		maxQueue = 1) {
		this.that = that;
		this.actions = [];
		this.resolve = () => { };
		this.reject = () => { };
		this.resultPromise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
		this.maxQueue = maxQueue;
		this.queueLength = 0;
		this.blocking = false;
		this.readyPromise = Promise.resolve();
	}
	async request<
		ElementType = Record<string, unknown> | Array<Record<string, unknown>>,
		>(actionType: OnOfficeAction,
			resourceType: OnOfficeResource,
			parameters: Record<string, unknown>,
			resourceid = '') {

		const credentials = (await this.that.getCredentials('onOfficeApi')) as ICredentialDataDecryptedObject;
		const apiSecret = credentials.apiSecret as string;
		const apiToken = credentials.apiToken as string;
		do {
			await this.readyPromise;
		} while (this.blocking);
		this.queueLength++;
		if (this.queueLength === this.maxQueue) {
			this.executeBatch();
		}

		const actionId = this.actions.length;
		this.actions[actionId] = undefined;
		const resultPromise = this.resultPromise;
		const action = createActionRequest(apiSecret, apiToken,
			actionType,
			resourceType,
			parameters,
			resourceid,
			'' + actionId);
		this.actions[actionId] = action;

		await resultPromise;
		const actionResponse = this.result?.['' + actionId] as OnOfficeActionResponse<ElementType> | undefined;

		const responses = [actionResponse];
		assertSuccessfulActionResponses(responses, this.that.getNode());

		const response = responses[0];

		const results = response.data.records;
		return results;
	}
	async executeBatch() {
		this.blocking = true;
		await this.readyPromise;
		let done = () => { };
		this.readyPromise = new Promise((resolve) => done = resolve);
		try {
			const responseData = await onOfficeApiCall(this.that, this.actions.flatMap(action => action ? [action] : []));
			this.actions = [];

			assertSuccessfulResponse(responseData, this.that.getNode());

			const actionResponses = responseData.response.results;

			actionResponses.forEach(response => {
				if (!this.result) {
					this.result = {};
				}
				this.result[response.identifier] = response;
			});

			this.resolve();
		} catch (error) {
			this.reject(error);
			throw error;
		} finally {
			this.queueLength = 0;
			this.blocking = false;
			this.resultPromise = new Promise((resolve, reject) => {
				this.resolve = resolve;
				this.reject = reject;
			});
			done();
		}
	}
}

/** Call the onOffice API with a single action */
export async function onOfficeApiAction<
	ElementType = Record<string, unknown> | Array<Record<string, unknown>>,
	>(
		that: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
		actionType: OnOfficeAction,
		resourceType: OnOfficeResource,
		parameters: Record<string, unknown>,
		resourceid = '',
) {
	const node = that.getNode();

	const credentials = (await that.getCredentials('onOfficeApi')) as ICredentialDataDecryptedObject;
	const apiToken = credentials.apiToken as string;
	const apiSecret = credentials.apiSecret as string;

	const action = createActionRequest(apiSecret, apiToken,
		actionType,
		resourceType,
		parameters,
		resourceid);

	const responseData = await onOfficeApiCall<ElementType>(that, [action]);

	assertSuccessfulResponse(responseData, node);

	const actionResponses = responseData.response.results;

	assertSuccessfulActionResponses(actionResponses, node);

	console.log(JSON.stringify(responseData));

	const results = actionResponses[0].data.records;
	return results;
}

export const createFilterParameter = (filterConfig?: OnOfficeReadFilterConfiguration) => {
	const filterOperatorMap = {
		is: 'is',
		or: 'or',
		equal: '=',
		greater: '>',
		less: '<',
		greaterequal: '>=',
		lessequal: '<=',
		notequal: '<>',
		between: 'between',
		like: 'like',
		notlike: 'not like',
		in: 'in',
		notin: 'not in',
	};

	const filter =
		filterConfig &&
		Object.fromEntries(
			filterConfig.filter.map((filter) => [
				filter.field,
				filter.operations.operation.map(({ operator, value }) => ({
					op: filterOperatorMap[operator],
					val: value,
				})),
			]),
		);

	return filter;
};

export async function getModuleDescription(
	that: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	module: string,
) {
	const resource = 'fields';
	const operation = 'get';

	const parameters = {
		modules: [module],
		labels: true,
	};

	const result = await onOfficeApiAction<OnOfficeFieldConfiguration<true>>(
		that,
		operation,
		resource,
		parameters,
	);

	const availableFields = Object.entries(result[0].elements).flatMap(([key, value]) =>
		typeof value !== 'string' ? [{ ...value, name: key }] : [],
	);
	return availableFields;
}

export const convertMultiselectFieldsToArray = (
	record: OnOfficeResponseRecord<Record<string, unknown>>,
) => {
	return {
		...record,
		elements: Object.fromEntries(
			Object.entries(record.elements).map(([key, value]) => [
				key,
				typeof value === 'string' && value.match(/^[|]?(\|[^|]+\|)+[|]?$/gm)
					? value.split('|').filter((v) => v)
					: value,
			]),
		),
	};
};
