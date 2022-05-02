import { INodeProperties } from 'n8n-workflow';

export const propertyGroupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['propertyGroup'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a property group',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Read a property group',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Read all properties group of a type',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a property group',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Archive a property group',
			},
		],
		default: 'get',
		description: 'The operation to perform.',
	},
];

export const propertyGroupFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*               propertyGroup:create                                         */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Object Type',
		name: 'objectType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['propertyGroup'],
				operation: ['create'],
			},
		},
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomObjectTypes',
		},
		default: '',
	},
	{
		displayName: 'Property Group name',
		name: 'groupName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['propertyGroup'],
				operation: ['create'],
			},
		},
		default: '',
		description:
			'The internal property group name, which must be used when referencing the property group via the API.',
	},
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['propertyGroup'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'A human-readable property label that will be shown in HubSpot.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['propertyGroup'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Display Order',
				name: 'displayOrder',
				type: 'number',
				default: 2,
				description:
					'Property groups are displayed in order starting with the lowest positive integer value. Values of -1 will cause the property group to be displayed after any positive values.',
			},
		],
	},
	/* -------------------------------------------------------------------------- */
	/*                  propertyGroup:get                                         */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Object Type',
		name: 'objectType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['propertyGroup'],
				operation: ['get'],
			},
		},
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomObjectTypes',
		},
		default: '',
	},
	{
		displayName: 'Property Group name',
		name: 'groupName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['propertyGroup'],
				operation: ['get'],
			},
		},
		default: '',
		description:
			'The internal property group name, which must be used when referencing the property group via the API.',
	},
	/* -------------------------------------------------------------------------- */
	/*               propertyGroup:getAll                                         */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Object Type',
		name: 'objectType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['propertyGroup'],
				operation: ['getAll'],
			},
		},
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomObjectTypes',
		},
		default: '',
	},
	/* -------------------------------------------------------------------------- */
	/*                propertyGroup:update                                        */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Object Type',
		name: 'objectType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['propertyGroup'],
				operation: ['update'],
			},
		},
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomObjectTypes',
		},
		default: '',
	},
	{
		displayName: 'Property Group name',
		name: 'groupName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['propertyGroup'],
				operation: ['update'],
			},
		},
		default: '',
		description:
			'The internal property group name, which must be used when referencing the property group via the API.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['propertyGroup'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				description: 'A human-readable property label that will be shown in HubSpot.',
			},
			{
				displayName: 'Display Order',
				name: 'displayOrder',
				type: 'number',
				default: 2,
				description:
					'Property groups are displayed in order starting with the lowest positive integer value. Values of -1 will cause the property group to be displayed after any positive values.',
			},
		],
	},
	/* -------------------------------------------------------------------------- */
	/*               property:delete                                              */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Object Type',
		name: 'objectType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['propertyGroup'],
				operation: ['delete'],
			},
		},
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomObjectTypes',
		},
		default: '',
	},
	{
		displayName: 'Property Group name',
		name: 'groupName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['propertyGroup'],
				operation: ['delete'],
			},
		},
		default: '',
		description:
			'The internal property group name, which must be used when referencing the property group via the API.',
	},
];
