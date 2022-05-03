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
	OnOfficeActionResponse,
	OnOfficeActionResponseSuccess,
	OnOfficeFieldConfiguration,
	OnOfficeReadFilterConfiguration,
	OnOfficeResource,
	OnOfficeResponse,
	OnOfficeResponseRecord,
	OnOfficeResponseSuccess,
} from './interfaces';
import { recordFields } from '../Google/BigQuery/RecordDescription';

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
	actions: Array<OnOfficeActionResponse<ElementType>>,
	node: INode,
) => asserts actions is Array<OnOfficeActionResponseSuccess<ElementType>> = (actions, node) => {
	actions.forEach((action) => {
		if (action.status.errorcode !== 0) {
			throw new NodeApiError(node, action as unknown as JsonObject, {
				httpCode: '500',
				description: action.status.message,
				message: 'The service failed to process your request',
			});
		}
	});
	if (actions.length === 0) {
		throw new NodeOperationError(node, 'The server did not send a response for any action');
	}
};

// tslint:disable-next-line: no-any
type requestType = (uriOrObject: any) => Promise<any>;

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
	const request = that.helpers.request;
	if (!request) {
		return [];
	}
	const credentials = (await that.getCredentials('onOfficeApi')) as ICredentialDataDecryptedObject;
	const apiSecret = credentials.apiSecret as string;
	const apiToken = credentials.apiToken as string;

	const identifier = '';
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

	const body = {
		token: apiToken,
		request: {
			actions: [action],
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
