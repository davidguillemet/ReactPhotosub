import React from 'react';
import Stack from '@mui/material/Stack';
import SendIcon from '@mui/icons-material/Send';
import { Button } from '@mui/material';
import { useTranslation, useLanguage } from 'utils';
import { useFormContext, FormContextProvider } from './FormContext';
import { useDarkMode } from 'components/theme';

import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';

import { styled } from '@mui/material/styles';
import { withLoading, buildLoadingState } from 'components/hoc';
const Div = styled('div')(() => {});
const HtmlForm = styled('form')(() => {})

const getFieldGroups = (fieldSpecs) => {
    const fieldsGroup = fieldSpecs.reduce((groups, fieldSpec) => {
        const field = fieldSpec.field;
        const groupName = field.group || field.id;
        const lastGroup = groups.length > 0 ? groups[groups.length - 1] : null;
        if (lastGroup && lastGroup.name === groupName) {
            // Same group as before
            lastGroup.fieldSpecs.push(fieldSpec);
        } else {
            // new group
            groups.push({
                name: groupName,
                fieldSpecs: [fieldSpec]
            });
        }
        return groups;
    }, []);
    return fieldsGroup;
}


const GroupedFormField = ({fieldSpecs}) => {

    const { darkMode } = useDarkMode();
    const formContext = useFormContext();
    const [ languageTab, setLanguageTab ] = React.useState(fieldSpecs[0].field.lang);

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
                    fieldSpecs.map(fieldSpec => {
                        const field = fieldSpec.field;
                        const hasError = formContext.hasError(field.id);
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
                    fieldSpecs.map(fieldSpec => {
                        const field = fieldSpec.field;
                        const FieldComponent = fieldSpec.component;
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
                                <FieldComponent
                                    fieldSpec={fieldSpec}
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

    const fieldGroups = React.useMemo(() => getFieldGroups(formContext.fieldSpecs), [formContext.fieldSpecs]);

    const EndCustomComponent = endCustomComponent;

    return (
        <React.Fragment>
            <HtmlForm sx={{width: "100%"}}>
            <Stack spacing={2} alignItems="center" sx={{width: '100%', paddingTop: 1}}>
            {
                fieldGroups.map(group => {
                    if (group.fieldSpecs.length === 1) {
                        const fieldSpec = group.fieldSpecs[0];
                        const field = fieldSpec.field;
                        const FieldComponent = fieldSpec.component;
                        return (
                            <FieldComponent
                                key={field.id}
                                fieldSpec={fieldSpec}
                                value={formContext.values[field.id]}
                                handleChange={formContext.handleChange}
                            />
                        )
                    } else {
                        return (
                            <GroupedFormField
                                key={group.name}
                                fieldSpecs={group.fieldSpecs}
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
                </Stack>
            }
            { endCustomComponent !== null &&  <EndCustomComponent values={formContext.values} /> }
            </Stack>
            </HtmlForm>
        </React.Fragment>
    )
};

function getMultilingualFields(fields, supportedLanguages) {

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

    const { supportedLanguages } = useLanguage(); 

    // Separate original fields from the other
    const { fields, ...otherProps } = props;

    // Create derived props from multilingual props
    const multilingualFields = React.useMemo(() => getMultilingualFields(fields, supportedLanguages), [fields, supportedLanguages]);

    return (
        <FormContextProvider {...otherProps} nativeFields={multilingualFields}>
            <Form {...otherProps} />
        </FormContextProvider>
    );
};

export default withLoading(MultilingualForm, [buildLoadingState("fields", [null, undefined])]);