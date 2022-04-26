import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { OnOfficeReadAdditionalFieldName, OnOfficeResource } from '../interfaces';
import { commonReadDescription } from './CommonReadDescription';


export const generateReadDataFieldsDescription = ({
	resource,
	specialFields,
	loadOptionsMethod,
}: {
	resource: OnOfficeResource;
	specialFields?: INodePropertyOptions[];
	loadOptionsMethod?: string;
}) =>
	[
		{
			displayName: 'Data fields',
			name: 'data',
			required: true,
			default: [],
			displayOptions: {
				show: {
					resource: [resource],
					operation: ['read'],
				},
			},
			description: 'The data fields to fetch',
			...(
				loadOptionsMethod ?
					{
						type: 'options',
						typeOptions: {
							loadOptionsMethod,
							multipleValues: true,
						},
					} : {
						type: 'string',
						typeOptions: {
							multipleValues: true,
						},
					}

			),
		},
		...(specialFields
			? [
				{
					displayName: 'Special data fields',
					name: 'specialData',
					type: 'multiOptions',
					displayOptions: {
						show: {
							resource: [resource],
							operation: ['read'],
						},
					},
					options: specialFields,
					default: [],
					description:
						'Some data fields have special meaning. Select the fields you want to include.',
				},
			]
			: []),
	] as INodeProperties[];

export const generateReadAdditionalFieldsDescription = ({
	resource,
	additionalFields,
}: {
	resource: OnOfficeResource;
	additionalFields?: INodeProperties[];
}) =>
	[
		{
			displayName: 'Additional Fields',
			name: 'additionalFields',
			type: 'collection',
			placeholder: 'Add Field',
			default: {},
			displayOptions: {
				show: {
					resource: [resource],
					operation: ['read'],
				},
			},
			options: [...commonReadDescription, ...(additionalFields || [])],
		},
	] as INodeProperties[];



export const generateUpdateDataFieldsDescription = ({
	resource,
	loadOptionsMethod,
	additionalFields
}: {
	resource: OnOfficeResource;
	loadOptionsMethod?: string;
	additionalFields?: INodeProperties[];
}) =>
	[
		{
			displayName: 'Resource ID',
			name: 'resourceId',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: [resource],
					operation: ['update'],
				},
			},
			default: '',
			description: `The resource ID of the ${resource} to update.`,
		},
		{
			displayName: 'Additional Fields',
			name: 'additionalFields',
			type: 'collection',
			placeholder: 'Add Field',
			default: {},
			displayOptions: {
				show: {
					resource: [resource],
					operation: ['update'],
				},
			},
			options: [
				{
					displayName: 'Custom Properties',
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

									default: '',
									description: 'Name of the property.',
									...(loadOptionsMethod ? {
										type: 'options',
										typeOptions: {
											loadOptionsMethod,
										},
									} : { type: 'string' }),
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
					...(additionalFields || [])
				},
			],
		},
	] as INodeProperties[];