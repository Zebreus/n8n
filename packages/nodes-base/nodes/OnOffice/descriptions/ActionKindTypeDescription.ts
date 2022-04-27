import { INodeProperties } from 'n8n-workflow';

// I'm not sure what this endpoint does, but it seems to be important.
// Documentation https://apidoc.onoffice.de/actions/informationen-abfragen/aktionsart-und-typ/
export const actionKindTypeOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
            show: {
                resource: ['actionkindtype'],
            },
        },
        options: [
            {
                name: 'Read',
                value: 'read',
                description: 'For reading the kind of action and type of action. Each kind of action only includes specific types of action.',
            },
        ],
        default: 'read',
        description: 'The operation to perform.',
    },
];

export const actionKindTypeFields: INodeProperties[] = [
    {
        displayName: 'Language',
        name: 'language',
        type: 'options',
        required: true,
        default: 'ENG',
        displayOptions: {
            show: {
                resource: ['actionkindtype'],
                operation: ['read'],
            },
        },
        options: [
            {
                name: 'English',
                value: 'ENG',
            },
            {
                name: 'German',
                value: 'DEU',
            },
        ],
        description: 'Language for translation of the label',
    },
];
