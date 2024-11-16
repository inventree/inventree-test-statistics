import { Box, Group, LoadingOverlay, MantineProvider, Paper, Text} from '@mantine/core';
import { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { DataTable } from 'mantine-datatable';

const queryClient = new QueryClient();

const TEST_STATISTICS_URL = "plugin/test_statistics/statistics/";

function TestStatisticsPanel({context}: {context: any}) {

    // Extract query params from the provided context
    const queryParams: any = useMemo(() => {
        let filters : any = context.context?.filters ?? {};


        filters.include_variants = true;
        // TODO: Extend based on user selection

        return filters;
    }, [context.context]);

    const statsQuery = useQuery(
        {
            queryKey: [
                'test-statistics',
                context.model,
                context.id,
                JSON.stringify(queryParams)
            ], 
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            queryFn: async () => {
                return context.api?.get(`/${TEST_STATISTICS_URL}`, {
                    params: queryParams
                }).then((response: any) => {
                    return response.data;
                }).catch(() => {
                    return [];
                }) ?? [];
            }
        },
        queryClient,
    );

    const columns = useMemo(() => {
        return [
            {
                accessor: 'template_detail.test_name',
                title: 'Test Name',
            },
            {
                accessor: 'template_detail.description',
                title: 'Description',
            },
            {
                accessor: 'pass_count',
                title: 'Passed',
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
                render: (record: any) => {
                    return record.pass_count + record.fail_count;
                }
            }
        ];
    }, []);

    return (
        <>
        <Paper withBorder p="sm" m="sm">
            <Box pos="relative">
            <LoadingOverlay visible={statsQuery.isLoading} />
            <DataTable
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                records={statsQuery.data}
                columns={columns}
                />
            </Box>
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
export function renderPanel(target: HTMLElement, context: any) {

    createRoot(target).render(
        <MantineProvider>
            <TestStatisticsPanel context={context}/>
        </MantineProvider>
    )

}