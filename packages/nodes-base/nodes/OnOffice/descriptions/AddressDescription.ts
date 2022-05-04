import { INodeProperties } from 'n8n-workflow';
import { commonReadDescription } from './CommonReadDescription';
import {
	generateCreateDataFieldsDescription,
	generateReadAdditionalFieldsDescription,
	generateReadDataFieldsDescription,
	generateUpdateDataFieldsDescription,
} from './descriptionHelpers';

export const addressOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['address'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create an address',
			},
			{
				name: 'Read',
				value: 'read',
				description: 'Read an address',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an address',
			},
		],
		default: 'read',
		description: 'The operation to perform.',
	},
];

export const addressFields: INodeProperties[] = [
	...generateCreateDataFieldsDescription({
		resource: 'address',
		loadOptionsMethod: 'getAddressProperties',
		additionalFields: [
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Normal phone entry.',
			},
			{
				displayName: 'Phone private',
				name: 'phonePrivate',
				type: 'string',
				default: '',
				description: 'Phone entry with type “private”',
			},
			{
				displayName: 'Phone business',
				name: 'phoneBusiness',
				type: 'string',
				default: '',
				description: 'Phone entry with type “private”',
			},
			{
				displayName: 'Phone mobile',
				name: 'mobile',
				type: 'string',
				default: '',
				description: 'Phone entry with type “mobile”',
			},
			{
				displayName: 'Default phone',
				name: 'defaultPhone',
				type: 'string',
				default: '',
				description: 'Default phone number. Sets one phone number as the main number. It must be set to the value of one of the phone numbers.',
			},
			{
				displayName: 'Fax',
				name: 'fax',
				type: 'string',
				default: '',
				description: 'Normal fax entry.',
			},
			{
				displayName: 'Fax private',
				name: 'faxPrivate',
				type: 'string',
				default: '',
				description: 'Fax entry with type “private”.',
			},
			{
				displayName: 'Fax business',
				name: 'faxBusiness',
				type: 'string',
				default: '',
				description: 'Fax entry with type “business”.',
			},
			{
				displayName: 'Default Fax',
				name: 'defaultFax',
				type: 'string',
				default: '',
				description: 'Default fax number. Sets one fax number as the main number. It must be set to the value of one of the fax numbers.',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Normal email entry.',
			},
			{
				displayName: 'Email business',
				name: 'emailBusiness',
				type: 'string',
				default: '',
				description: 'Email entry with type “business”.',
			},
			{
				displayName: 'Email private',
				name: 'emailPrivate',
				type: 'string',
				default: '',
				description: 'Email entry with type “private”.',
			},
			{
				displayName: 'Default Email',
				name: 'defaultEmail',
				type: 'string',
				default: '',
				description: 'Default email address. Sets one email address as the main address. It must be set to the value of one of the email addresses.',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'Active',
						value: 1,
					}, {
						name: 'Archived',
						value: 0,
					},
				],
				default: 1,
			},
			{
				displayName: 'Check duplicate',
				name: 'checkDuplicate',
				type: 'boolean',
				default: false,
				description: 'If true, a duplicate check is performed for the field “email”. Without the parameter noOverrideByDuplicate, the data of the already existing address is updated or overwritten. If there are several duplicates, the duplicate with the lowest ID will be updated.',
			},
			{
				displayName: 'No override by duplicate',
				name: 'noOverrideByDuplicate',
				type: 'boolean',
				default: false,
				description: 'If true, the duplicate check with parameter checkDuplicate does not update or overwrite the data of the already existing address.',
			},
		],
	}),
	...generateUpdateDataFieldsDescription({
		resource: 'address',
		loadOptionsMethod: 'getAddressProperties',
	}),
	...generateReadDataFieldsDescription({
		resource: 'address',
		loadOptionsMethod: 'getAddressProperties',
		specialFields: [
			{
				name: 'phone',
				value: 'phone',
				description: 'All phonebook entries except with type “mobile”',
			},
			{
				name: 'mobile',
				value: 'mobile',
				description: 'All phone book entries with type “mobile”',
			},
			{
				name: 'fax',
				value: 'fax',
				description: 'All phone book entries with type “fax”',
			},
			{
				name: 'email',
				value: 'email',
				description: 'All phone book entries with type “email”',
			},
			{
				name: 'defaultphone',
				value: 'defaultphone',
				description: 'Like phone, but only returns the record marked as default',
			},
			{
				name: 'defaultfax',
				value: 'defaultfax',
				description: 'Like fax, but only returns the record marked as default',
			},
			{
				name: 'defaultemail',
				value: 'defaultemail',
				description: 'Like email, but only returns the record marked as default',
			},
			{
				name: 'imageUrl',
				value: 'imageUrl',
				description: 'Image URL (pass photo) of the address',
			},
			{
				name: 'Aenderung',
				value: 'Aenderung',
				description: 'Date of the last change',
			},
		],
	}),
	...generateReadAdditionalFieldsDescription({
		resource: 'address',
		additionalFields: [
			{
				displayName: 'Record IDs',
				name: 'recordIds',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				description: 'Can be used if one or more than one record should be read, but not all',
			},
			{
				displayName: 'Filter ID',
				name: 'filterId',
				type: 'number',
				typeOptions: {
					minValue: 0,
					numberPrecision: 0,
				},
				default: 0,
				description: 'Restrict the selection of address data records by a existing filter',
			},
			{
				//TODO: Figure out what this does
				displayName: 'Format output',
				name: 'formatOutput',
				type: 'boolean',
				default: false,
				description: 'Enable formatted output',
			},
			{
				//TODO: Figure out what this does
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: '',
				description: 'Output language',
			},
			{
				displayName: 'Country format',
				name: 'countryIsoCodeType',
				type: 'options',
				options: [
					{
						name: 'Text',
						value: '',
					},
					{
						name: 'ISO-3166-2',
						value: 'ISO-3166-2',
					},
					{
						name: 'ISO-3166-3',
						value: 'ISO-3166-3',
					},
				],
				default: '',
				description:
					'Causes the field "Land" to be displayed as a ISO-3166-2 or ISO-3166-3 country code',
			},
		],
	}),
];
