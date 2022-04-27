import { access } from 'fs';
import { INodeProperties } from 'n8n-workflow';

const generateRelationTypeOptions = (knownRelationTypes: string[]): INodeProperties[] => {
    const relationTypeRegex =
        /urn:onoffice-de-ns:smart:2\.5:relationTypes:([a-zA-Z]+):([a-zA-Z]+)(:([a-zA-Z]+))?/;
    const splitRelationTypes = knownRelationTypes.flatMap((relationType) => {
        const match = relationType.match(relationTypeRegex);
        return match
            ? [
                {
                    parentType: match[1],
                    childType: match[2],
                    relationType: match[4] || undefined,
                },
            ]
            : [];
    });

    const relationTypeTree = splitRelationTypes.reduce(
        (acc, { parentType, childType, relationType }) => {
            let entry = acc.find(({ parentType: type }) => type === parentType);
            if (!entry) {
                entry = {
                    parentType,
                    children: [],
                };
                acc.push(entry);
            }

            let childEntry = entry.children.find(({ childType: type }) => type === childType);
            if (!childEntry) {
                childEntry = {
                    childType,
                    relations: [],
                };
                entry.children.push(childEntry);
            }

            childEntry.relations = [...childEntry.relations, relationType || ''];
            return acc;
        },
        [] as Array<{
            parentType: string;
            children: Array<{ childType: string; relations: string[] }>;
        }>,
    );

    const typeToName = (type: string) =>
        type.charAt(0).toUpperCase() + type.slice(1).replace(/[A-Z]/g, ' $&');

    return [
        {
            displayName: 'Parent Type',
            name: 'parentType',
            type: 'options',
            options: relationTypeTree.map(({ parentType: type }) => ({
                name: typeToName(type),
                value: type,
            })),
            default: relationTypeTree[0].parentType,
            required: true,
            description: 'The type of the parent in the relationship',
            displayOptions: {
                show: {
                    resource: ['relation'],
                },
            },
        },
        ...relationTypeTree.flatMap(({ parentType: type, children }) => [
            {
                displayName: 'Child Type',
                name: 'childType',
                type: 'options',
                options: children.map(({ childType }) => ({
                    name: typeToName(childType),
                    value: childType,
                })),

                default: children[0].childType,
                required: true,
                description: 'The type of the child in the relationship',
                displayOptions: {
                    show: {
                        resource: ['relation'],
                        parentType: [type],
                    },
                },
            },
            ...children.flatMap(({ childType, relations }) => [
                {
                    displayName: 'Relation Type',
                    name: 'relation',
                    type: 'options',
                    options: relations.map((type) => ({
                        name: typeToName(type || 'default'),
                        value: type,
                    })),

                    default: relations[0],
                    required: true,
                    description: 'The relation betwen the child and the parent.',
                    displayOptions: {
                        show: {
                            resource: ['relation'],
                            parentType: [type],
                            childType: [childType],
                        },
                    },
                },
            ]),
        ]),
    ] as INodeProperties[];
};

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
                name: 'Create',
                value: 'create',
                description: 'Create an relation',
            },
            {
                name: 'Read',
                value: 'read',
                description: 'Read an relation',
            },
        ],
        default: 'get',
        description: 'The operation to perform.',
    },
    ...generateRelationTypeOptions([
        // List generate from API documentation with
        // curl https://apidoc.onoffice.de/actions/informationen-abfragen/relationen/ 2>/dev/null | grep -Po "urn:onoffice-de-ns:smart:2.5:relationTypes:[:\-a-zA-Z]*" | sort | uniq | sed "s/.*/'\0',/g"
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:address:isTippgeberOf',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:contact:address',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:customer',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:estate:contacted',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:estate:matching',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:estate:offer',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:estate:offerByAgentsLog',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:estate:tipp',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:file:attachment',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:mail',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:process',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:resubmission',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:searchcriteria',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:user:additionalOfficers',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:user:officer',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:address:user:strangeNameRelation',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:agentsLog:address',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:agentsLog:attachment:download',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:agentsLog:estate',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:agentsLog:file:attachment',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:agentsLogMail:address',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:agentsLogMail:estate',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:billing:estate',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:calendar:address',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:calendar:estate',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:calendar:file:attachment',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:complex:estate:units',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:customer:address:contact',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:contactPerson',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:contactPersonAll',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:interested',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:matching',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:owner',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:renter',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:tenant',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:allFiles',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:estateUnit',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:file:alllinks',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:file:allpictures',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:file:allpicturesExceptTitelbild',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:file:foto',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:file:grundriss',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:file:titelbild',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:mail',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estateTracking:estate',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:user:assignment',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:estate:user:officer',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:job:estate',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:project:address',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:project:agentslog',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:project:calendar',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:project:estate',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:project:file:attachment',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:project:task:customer',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:task:address',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:task:estate',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:task:file:attachment',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:templateManagement:email:attachment',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:templateManagement:email:documentAttributes',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:user:address',
        'urn:onoffice-de-ns:smart:2.5:relationTypes:user:address:birthday',
    ]),
];



export const relationFields: INodeProperties[] = [
    /* -------------------------------------------------------------------------- */
    /*                             relation:create                                */
    /* -------------------------------------------------------------------------- */

    {
        displayName: 'Parent IDs',
        name: 'parentid',
        type: 'string',
        typeOptions: {
            multipleValues: true,
        },
        default: [],
        description: 'The IDs of the parent elements in the relation. Keep in mind, that you cannot create n:n relations, only 1:n, n:1 or 1:1.',
        displayOptions: {
            show: {
                resource: ['relation'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Child IDs',
        name: 'childid',
        type: 'string',
        typeOptions: {
            multipleValues: true,
        },
        default: [],
        description: 'The IDs of the child elements in the relation. Keep in mind, that you cannot create n:n relations, only 1:n, n:1 or 1:1.',
        displayOptions: {
            show: {
                resource: ['relation'],
                operation: ['create'],
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
                operation: ['create'],
            },
        },
        options: [
            {
                displayName: 'Relation info',
                description: 'For now, only the confirmation status of an appointment can be set by relationinfo. The key for that is statusTerminbestaetigung. The possible values are: bestätigt (confirmed), gesendet (sent), gecancelt (cancelled), nicht gesetzt (not set)',
                name: 'relationInfo',
                placeholder: 'Add Info',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                default: {},
                options: [
                    {
                        name: 'customRelationInfo',
                        displayName: 'Relation Info',
                        values: [
                            {
                                displayName: 'Key',
                                name: 'key',
                                default: 'statusTerminbestaetigung',
                                description: 'Name of the property. For now, only the confirmation status of an appointment can be set by relationinfo. For the values are: bestätigt (confirmed), gesendet (sent), gecancelt (cancelled), nicht gesetzt (not set)',
                                type: 'string',
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
            }
        ],
    },



    /* -------------------------------------------------------------------------- */
    /*                              relation:read                                 */
    /* -------------------------------------------------------------------------- */

    {
        displayName: 'Query by child IDs',
        name: 'useChildIds',
        type: 'boolean',
        default: false,
        displayOptions: {
            show: {
                resource: ['relation'],
                operation: ['read'],
            },
        },
        description:
            'Query by child IDs instead of parent IDs. The result will contain the related parent IDs',
    },
    {
        displayName: 'Parent IDs',
        name: 'ids',
        type: 'string',
        typeOptions: {
            multipleValues: true,
        },
        default: [],
        description: 'An array of IDs to look for linked IDs on the other side.',
        displayOptions: {
            show: {
                resource: ['relation'],
                operation: ['read'],
                useChildIds: [false],
            },
        },
    },
    {
        displayName: 'Child IDs',
        name: 'ids',
        type: 'string',
        typeOptions: {
            multipleValues: true,
        },
        default: [],
        description: 'An array of IDs to look for linked IDs on the other side.',
        displayOptions: {
            show: {
                resource: ['relation'],
                operation: ['read'],
                useChildIds: [true],
            },
        },
    },
];
