import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-core';
import {
	ICredentialDataDecryptedObject,
	IDataObject,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { addressFields, addressOperations } from './descriptions/AddressDescription';
import { OnOfficeFieldConfiguration, OnOfficeReadAdditionalFields } from './interfaces';
import { estateFields, estateOperations } from './descriptions/EstateDescription';
import {
	fieldConfigurationFields,
	fieldConfigurationOperations,
} from './descriptions/FieldConfigurationDescription';
import { createFilterParameter, getModuleDescription, onOfficeApiAction } from './GenericFunctions';
import {
	searchCriteriasFields,
	searchCriteriasOperations,
} from './descriptions/SearchCriteriasDescription';
import {
	searchCriteriaFieldsFields,
	searchCriteriaFieldsOperations,
} from './descriptions/SearchCriteriaFieldsDescription';
import { relationFields, relationOperations } from './descriptions/RelationDescription';

export class OnOffice implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OnOffice',
		name: 'onOffice',
		icon: 'file:onoffice.svg',
		group: ['transform'],
		version: 1,
		description: 'Consume OnOffice API',
		documentationUrl: 'https://apidoc.onoffice.de/',
		defaults: {
			name: 'OnOffice',
			color: '#80a9d7',
		},
		inputs: ['main'],
		outputs: ['main'],
		subtitle: '={{$parameter["operation"] + " " + $parameter["resource"]}}',
		credentials: [
			{
				name: 'onOfficeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Estate',
						value: 'estate',
					},
					{
						name: 'Address',
						value: 'address',
					},
					{
						name: 'Field Configuration',
						value: 'fields',
					},
					{
						name: 'Search Criterias',
						value: 'searchcriterias',
					},
					{
						name: 'Search Criteria Fields',
						value: 'searchCriteriaFields',
					},
					{
						name: 'Relation',
						value: 'relation',
					},
				],
				default: 'address',
				required: true,
				description: 'Resource to consume',
			},

			...addressOperations,
			...addressFields,

			...estateOperations,
			...estateFields,

			...fieldConfigurationOperations,
			...fieldConfigurationFields,

			...searchCriteriasOperations,
			...searchCriteriasFields,

			...searchCriteriaFieldsOperations,
			// ...searchCriteriaFieldsFields,

			...relationOperations,
			...relationFields,
		],
	};

	methods = {
		loadOptions: {
			/* -------------------------------------------------------------------------- */
			/*                               Address                                      */
			/* -------------------------------------------------------------------------- */

			// Get all fields of address
			async getAddressProperties(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const availableFields = await getModuleDescription.call(this, 'address');
				const fieldNameOptions = availableFields.map((field) => ({
					name: field.label,
					value: field.name,
				}));
				return fieldNameOptions;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const request = this.helpers.request;

		const returnData = [];

		let resource = this.getNodeParameter('resource', 0) as string;
		let operation = this.getNodeParameter('operation', 0) as string;

		const credentials = (await this.getCredentials(
			'onOfficeApi',
		)) as ICredentialDataDecryptedObject;

		const apiSecret = credentials.apiSecret as string;
		const apiToken = credentials.apiToken as string;

		for (let i = 0; i < items.length; i++) {
			switch (resource) {
				case 'relation':
					{
						const relationtype = `urn:onoffice-de-ns:smart:2.5:relationTypes:${this.getNodeParameter(
							'parentType',
							i,
							null,
						)}:${this.getNodeParameter('childType', i, null)}${this.getNodeParameter('relation', i, null)
							? ':' + this.getNodeParameter('relation', i, null)
							: ''
							}`;

						if (operation === 'create' || operation === 'update') {
							const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

							const tempRelationinfo: Record<string, unknown> = {};
							if (additionalFields.relationInfo) {
								const customRelationInfo = (additionalFields.relationInfo as IDataObject)
									.customRelationInfo as IDataObject[];

								if (customRelationInfo) {
									for (const customProperty of customRelationInfo) {
										tempRelationinfo[customProperty.key as string] = customProperty.value;
									}
								}
							}
							const relationinfo = Object.keys(tempRelationinfo).length
								? tempRelationinfo
								: undefined;

							const parentIds = this.getNodeParameter('parentids', i, null) || [
								this.getNodeParameter('parentid', i, null),
							];
							const childIds = this.getNodeParameter('childids', i, null) || [
								this.getNodeParameter('childid', i, null),
							];

							const onOfficeAction = operation === 'update' ? 'modify' : operation;

							const result = await onOfficeApiAction(
								this.getNode(),
								request,
								apiSecret,
								apiToken,
								onOfficeAction,
								resource,
								{
									relationtype,
									parentid: parentIds,
									childid: childIds,
									relationinfo,
								},
								'relation',
							);

							returnData.push(result.length ? result : [{ success: true }]);
						}

						if (operation === 'delete') {
							const result = await onOfficeApiAction(
								this.getNode(),
								request,
								apiSecret,
								apiToken,
								operation,
								resource,
								{
									relationtype,
									parentid: this.getNodeParameter('parentid', i, null),
									childid: this.getNodeParameter('childid', i, null),
								},
								'relation',
							);

							returnData.push(result.length ? result : [{ success: true }]);
						}
						if (operation === 'read') {
							const result = await onOfficeApiAction(
								this.getNode(),
								request,
								apiSecret,
								apiToken,
								'get',
								'idsfromrelation',
								{
									relationtype,
									parentids: this.getNodeParameter('parentids', i, null),
									childids: this.getNodeParameter('childids', i, null),
								},
							);

							returnData.push(result);
						}
					}
					break;
				case 'estate':
				case 'address':
					{
						if (operation === 'create') {
							const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

							const properties: Record<string, unknown> = {};
							if (additionalFields.customPropertiesUi) {
								const customProperties = (additionalFields.customPropertiesUi as IDataObject)
									.customPropertiesValues as IDataObject[];

								if (customProperties) {
									for (const customProperty of customProperties) {
										properties[customProperty.property as string] = customProperty.value;
									}
								}
							}

							const parameters = {
								...properties,
							};

							const result = await onOfficeApiAction(
								this.getNode(),
								request,
								apiSecret,
								apiToken,
								'create',
								resource,
								parameters,
							);

							returnData.push(result);
						}
						if (operation === 'read') {
							const dataFields = [
								...(this.getNodeParameter('data', i) as string[]),
								...(this.getNodeParameter('specialData', i) as string[]),
							];

							const additionalFields = this.getNodeParameter(
								'additionalFields',
								i,
							) as OnOfficeReadAdditionalFields;

							const parameters = {
								data: dataFields,
								recordids: additionalFields.recordIds,
								filterid: additionalFields.filterId,
								filter: createFilterParameter(additionalFields.filters),
								listlimit: additionalFields.limit,
								listoffset: additionalFields.offset,
								sortby: additionalFields.sortBy,
								sortorder: additionalFields.order,
								formatoutput: additionalFields.formatOutput,
								outputlanguage: additionalFields.language,
								countryIsoCodeType: additionalFields.countryIsoCodeType || undefined,
								estatelanguage: additionalFields.estateLanguage,
								addestatelanguage: additionalFields.addEstateLanguage,
								addMainLangId: additionalFields.addMainLangId,
								georangesearch: additionalFields.geoRangeSearch,
							};

							const result = await onOfficeApiAction(
								this.getNode(),
								request,
								apiSecret,
								apiToken,
								'read',
								resource,
								parameters,
							);

							returnData.push(result);
						}
						if (operation === 'update') {
							const resourceId = this.getNodeParameter('resourceId', i) as string;

							const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

							const properties: Record<string, unknown> = {};
							if (additionalFields.customPropertiesUi) {
								const customProperties = (additionalFields.customPropertiesUi as IDataObject)
									.customPropertiesValues as IDataObject[];

								if (customProperties) {
									for (const customProperty of customProperties) {
										properties[customProperty.property as string] = customProperty.value;
									}
								}
							}

							const parameters = properties;

							const result = await onOfficeApiAction(
								this.getNode(),
								request,
								apiSecret,
								apiToken,
								'modify',
								resource,
								parameters,
								resourceId,
							);

							returnData.push(result);
						}
					}
					break;
				case 'fields':
				case 'searchcriterias':
				case 'searchCriteriaFields':
					{
						if (operation === 'get') {
							const additionalFields = this.getNodeParameter(
								'additionalFields',
								i,
								{},
							) as IDataObject;

							const parameters = {
								modules: this.getNodeParameter('modules', i, null) as string[] | undefined,
								labels: additionalFields.labels,
								language: additionalFields.language,
								fieldList: additionalFields.fieldList,
								showOnlyInactive: additionalFields.showOnlyInactive,
								listlimit: additionalFields.limit,
								realDataTypes: additionalFields.realDataTypes,
								showFieldMeasureFormat: additionalFields.showFieldMeasureFormat,
								ids: this.getNodeParameter('ids', i, null) as string[] | undefined,
								mode: this.getNodeParameter('mode', i, null) as string | undefined,
							};

							const result = await onOfficeApiAction(
								this.getNode(),
								request,
								apiSecret,
								apiToken,
								'get',
								resource,
								parameters,
							);

							returnData.push(result);
						}
					}
					break;
				default:
			}
		}

		const result = returnData.flat() as unknown as IDataObject[];

		// Map data to n8n data structure
		return [this.helpers.returnJsonArray(result)];
	}
}
