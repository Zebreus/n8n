import { INodeProperties } from 'n8n-workflow';

export const searchCriteriaOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['searchcriteria'],
			},
		},
		options: [
			{
				name: 'Read',
				value: 'read',
				description: 'Get all search criteria (fields + values) for a list of addresses or search criteria',
			},
			{
				name: 'List fields',
				value: 'listFields',
				description: 'With this API call all fields can be queried that are marked / selected as search criteria',
			},
		],
		default: 'read',
		description: 'The operation to perform.',
	},
];

export const searchCriteriaFields: INodeProperties[] = [
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		required: true,
		default: 'searchcriteria',
		displayOptions: {
			show: {
				resource: ['searchcriteria'],
				operation: ['read'],
			},
		},
		options: [
			{
				name: 'Internal ID',
				value: 'internal',
				description: 'Returns the search criteria of the specified addresses. You specify the address via the internal address ID.',
			},
			{
				name: 'External ID',
				value: 'external',
				description: 'Returns all search criteria of the specified addresses. Here the external address numbers are used.',
			},
			{
				name: 'Searchcriteria ID',
				value: 'searchcriteria',
				description: 'Returns the search criteria for specified search criteria IDs',
			},
		],
		description: 'Type of transmitted IDs',
	},
	{
		displayName: 'IDs',
		name: 'ids',
		type: 'string',
		default: [],
		displayOptions: {
			show: {
				resource: ['searchcriteria'],
				operation: ['read'],
			},
		},
		typeOptions: {
			multipleValues: true,
		},
		description: 'Array of IDs. The type of the ids depends on the mode.',
	},
];
