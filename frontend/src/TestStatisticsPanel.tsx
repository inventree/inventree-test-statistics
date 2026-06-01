import { Alert, Group, Paper, Text} from '@mantine/core';
import { useMemo } from 'react';
import { InvenTreePluginContext, InvenTreeTable, useTable } from '@inventreedb/ui';
import { IconInfoCircle } from '@tabler/icons-react';

const TEST_STATISTICS_URL = "plugin/test_statistics/statistics/";

function TestStatisticsPanel({context}: {context: InvenTreePluginContext}) {

    const tableState = useTable('test-statistics-table');

    const columns = useMemo(() => {
        return [
            {
                accessor: 'template_detail.test_name',
                title: 'Test Name',
                switchable: false,
            },
            {
                accessor: 'template_detail.description',
                title: 'Description',
            },
            {
                accessor: 'pass_count',
                title: 'Passed',
                switchable: false,
                render: (record: any) => {
                    let total = record.pass_count + record.fail_count;
                    let pass_pct = total > 0 ? (record.pass_count / total) * 100 : 0;

                    return (
                        <Group justify='space-between' wrap="nowrap">
                            <Text>{record.pass_count}</Text>
                            {total > 0 && <Text size="xs">({pass_pct.toFixed(2)}%)</Text>}
                        </Group>
                    )
                }
            },
            {
                accessor: 'fail_count',
                title: 'Failed',
                switchable: false,
                render: (record: any) => {
                    let total = record.pass_count + record.fail_count;
                    let fail_pct = total > 0 ? (record.fail_count / total) * 100 : 0;

                    return (
                        <Group justify='space-between' wrap="nowrap">
                            <Text>{record.fail_count}</Text>
                            {total > 0 && <Text size="xs">({fail_pct.toFixed(2)}%)</Text>}
                        </Group>
                    )
                }
            },
            {
                accessor: 'total',
                title: 'Total',
                switchable: false,
                render: (record: any) => {
                    return record.pass_count + record.fail_count;
                }
            }
        ];
    }, []);

    return (
        <>
        <Alert color='blue' icon={<IconInfoCircle />} title="Test Statistics">
            This panel displays statistics about the tests that have been executed. The data is aggregated by test template, and includes the total number of times each test has been executed, as well as the pass/fail counts
            and percentages.
        </Alert>
        <Paper withBorder p="sm" m="sm">
            <InvenTreeTable
                url={TEST_STATISTICS_URL}
                tableState={tableState}
                columns={columns}
                props={{
                    params: {
                        ...(context.context?.filters ?? {}),
                        include_variants: true,
                    },
                    enableSearch: false,
                }}
                context={context}
            />
        </Paper>
        </>
    );
}


/**
 * Render the TestStatisticsPanel component
 * 
 * @param target - The target HTML element to render the panel into
 * @param context - The context object to pass to the panel
 */
export function renderPanel(context: InvenTreePluginContext) {

    return <TestStatisticsPanel context={context}/>;
}