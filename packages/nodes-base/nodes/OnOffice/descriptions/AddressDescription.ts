import { INodeProperties } from 'n8n-workflow';
import { commonReadDescription } from './CommonReadDescription';
import {
	generateReadAdditionalFieldsDescription,
	generateReadDataFieldsDescription,
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
	{
		displayName: 'Resource ID',
		name: 'resourceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['address'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'The resource ID of the address to update.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['address'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Properties',
				name: 'customPropertiesUi',
				placeholder: 'Add Property',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'customPropertiesValues',
						displayName: 'Custom Property',
						values: [
							{
								displayName: 'Property',
								name: 'property',
								type: 'string',
								default: '',
								required: true,
								description: 'Name of the property.',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the property',
							},
						],
					},
				],
			},
		],
	},
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
