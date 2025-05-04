import React from 'react';
import Stack from '@mui/material/Stack';
import { FormField }from './FormField';
import SendIcon from '@mui/icons-material/Send';
import { Button } from '@mui/material';
import { useTranslation, useLanguage } from 'utils';
import { useFormContext, FormContextProvider } from './FormContext';
import { useDarkMode } from 'components/theme';

import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';

import { styled } from '@mui/material/styles';
const Div = styled('div')(() => {});
const HtmlForm = styled('form')(() => {})

export const FIELD_TYPE_TEXT = 'text';
export const FIELD_TYPE_TAGS_FIELD = 'tagsField';
export const FIELD_TYPE_NUMBER = 'number';
export const FIELD_TYPE_EMAIL = 'email';
export const FIELD_TYPE_URL = 'url';
export const FIELD_TYPE_SWITCH = 'switch';
export const FIELD_TYPE_DATE = 'date';
export const FIELD_TYPE_SELECT = 'select';
export const FIELD_TYPE_CHECK_BOX = 'checkbox';
export const FIELD_TYPE_PASSWORD = 'password';
export const FIELD_TYPE_LATLONG = "latlong";
export const FIELD_TYPE_CAPTCHA = 'reCaptcha';

const getFieldGroups = (fields) => {
    const fieldsGroup = fields.reduce((groups, field) => {
        const groupName = field.group || field.id;
        const lastGroup = groups.length > 0 ? groups[groups.length - 1] : null;
        if (lastGroup && lastGroup.name === groupName) {
            // Same group as before
            lastGroup.fields.push(field);
        } else {
            // new group
            groups.push({
                name: groupName,
                fields: [field]
            });
        }
        return groups;
    }, []);
    return fieldsGroup;
}


const GroupedFormField = ({fields}) => {

    const { darkMode } = useDarkMode();
    const formContext = useFormContext();
    const [ languageTab, setLanguageTab ] = React.useState(fields[0].lang);

    const handleChangeTab = (event, newValue) => {
        setLanguageTab(newValue);
    };

    const selectedTabBgColor = (theme) => darkMode ? theme.palette.grey[700] : theme.palette.grey[200];

    return (
        <TabContext value={languageTab}>
            <Div sx={{width: '100%'}}>
                <TabList
                    onChange={handleChangeTab}
                    sx={{
                        width: '100%',
                        p: 0,
                        '&.MuiTabs-root': {
                            minHeight: 0
                        }
                    }}
                    textColor='secondary'
                    indicatorColor='secondary'
                >
                {
                    fields.map(field => {
                        const hasError = formContext.hasError(field);
                        return (
                            <Tab
                                key={`tab_${field.id}`}
                                label={`${field.label} (${field.lang}) ${field.required ? '*' : ''}`}
                                value={field.lang}
                                sx={{
                                    textTransform: 'none',
                                    '&.MuiButtonBase-root': {
                                        minHeight: 0,
                                        paddingTop: 0.5,
                                        paddingBottom: 0.5,
                                        borderTopRightRadius: '4px',
                                        borderTopLeftRadius: '4px',
                                        borderWidth: '1px',
                                        borderBottomWidth: 0,
                                        borderStyle: 'solid',
                                        borderColor: theme => theme.palette.divider,
                                        marginRight: 0.5,
                                        marginLeft: 0.5
                                    },
                                    '&.Mui-selected' : {
                                        backgroundColor: selectedTabBgColor
                                    },
                                    ...(hasError && {
                                        color: theme => theme.palette.error.main,
                                        '&.Mui-selected': {
                                            color: theme => theme.palette.error.main,
                                            backgroundColor: selectedTabBgColor
                                        }
                                    })
                                }}
                            />
                        );
                    })
                }
                </TabList>
                {
                    fields.map(field => {
                        return (
                            <Div
                                key={`panel_${field.id}`}
                                role="tabpanel"
                                hidden={field.lang !== languageTab}
                                sx={{
                                    width: '100%',
                                    p: 0,
                                    marginTop: 0
                                }}
                            >
                                <FormField
                                    field={field}
                                    value={formContext.values[field.id]}
                                    handleChange={formContext.handleChange}
                                    group={true}
                                />
                            </Div>
                        )
                    })
                }
            </Div>
        </TabContext>
    );
};

const Form = ({
    submitAction,
    onCancel = null,
    submitCaption = "Envoyer",
    submitIcon = <SendIcon />,
    submitIconPosition = "start",
    startCustomComponent = null,
    endCustomComponent = null}) => {

    const formContext = useFormContext();
    const t = useTranslation("components.form");

    const fieldGroups = React.useMemo(() => getFieldGroups(formContext.fields), [formContext.fields]);

    return (
        <React.Fragment>
            <HtmlForm sx={{width: "100%"}}>
            <Stack spacing={2} alignItems="center" sx={{width: '100%', paddingTop: 1}}>
            {
                fieldGroups.map(group => {
                    if (group.fields.length === 1) {
                        const field = group.fields[0];
                        return (
                            <FormField
                                key={field.id}
                                field={field}
                                value={formContext.values[field.id]}
                                handleChange={formContext.handleChange}
                            />
                        )
                    } else {
                        return (
                            <GroupedFormField
                                key={group.name}
                                fields={group.fields}
                            />
                        )
                    }
                })
            }
            {   (submitAction || onCancel) &&
                <Stack spacing={1} direction="row" sx={{mt: 2}}>
                    { startCustomComponent !== null &&  startCustomComponent }
                    {
                        onCancel !== null &&
                        <Button onClick={onCancel}>
                            {t("btn:cancel")}
                        </Button>
                    }
                    {
                        submitAction !== null &&
                        <Button
                            onClick={formContext.onSubmit}
                            disabled={formContext.readOnly || !formContext.isValid || !formContext.isDirty}
                            startIcon={submitIconPosition === "start" && submitIcon}
                            endIcon={submitIconPosition === "end" && submitIcon}
                            loadingPosition={submitIconPosition}
                            loading={formContext.sending}
                            type="submit"
                            variant="contained"
                        >
                            {submitCaption}
                        </Button>
                    }
                    { endCustomComponent !== null &&  endCustomComponent }
                </Stack>
            }
            </Stack>
            </HtmlForm>
        </React.Fragment>
    )
};

function useMultilingualFields(fields) {
    const { supportedLanguages } = useLanguage(); 

    const expandedFields = fields.reduce((newFields, field) => {
        if (field.multiLingual) {
            supportedLanguages.forEach(lang => {
                const langField = {
                    ...field,
                    id: lang === 'fr' ? field.id : `${field.id}_${lang}`,
                    lang,
                    group: field.id // initial field id
                };
                newFields.push(langField);
            });
        } else {
            newFields.push(field);
        }
        return newFields;
    }, []);

    return expandedFields;
}

const MultilingualForm = (props) => {

    // Separate original fields from the other
    const { fields, ...otherProps } = props;
    // Create derived props from multilingual props
    const multilingualFields = useMultilingualFields(fields);

    return (
        <FormContextProvider {...otherProps} fields={multilingualFields}>
            <Form {...otherProps} />
        </FormContextProvider>
    );
};

export default MultilingualForm;