import { INodeProperties } from 'n8n-workflow';

export const relationOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
            show: {
                resource: ['relation'],
            },
        },
        options: [
            {
                name: 'Read',
                value: 'read',
                description: 'Read an relation',
            },
        ],
        default: 'get',
        description: 'The operation to perform.',
    },
];


export const relationFields: INodeProperties[] = [
    {
        displayName: 'Parent Type',
        name: 'parentType',
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
        ],
        default: 'estate',
        required: true,
        description: 'An array of IDs to look for linked IDs on the other side. If set, child IDs must not be set.',
        displayOptions: {
            show: {
                resource: ['relation'],
                operation: ['read'],
            },
        },
    },
    {
        displayName: 'Child Type',
        name: 'childType',
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
        ],
        default: 'estate',
        required: true,
        description: 'An array of IDs to look for linked IDs on the other side. If set, child IDs must not be set.',
        displayOptions: {
            show: {
                resource: ['relation'],
                operation: ['read'],
            },
        },
    },
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['relation'],
                operation: ['read'],
            },
        },
        options: [
            {
                displayName: 'Parent IDs',
                name: 'parentids',
                type: 'string',
                typeOptions: {
                    multipleValues: true,
                },
                default: [],
                description: 'An array of IDs to look for linked IDs on the other side. If set, child IDs must not be set.',
            },
            {
                displayName: 'Child IDs',
                name: 'childids',
                type: 'string',
                typeOptions: {
                    multipleValues: true,
                },
                default: [],
                description: 'An array of IDs to look for linked IDs on the other side. If set, parent IDs must not be set.',
            },
            {
                displayName: 'Relation',
                name: 'relation',
                type: 'string',
                default: null,
                description: 'The relation betwen the child and the parent.',
            },
        ],
    },
];
