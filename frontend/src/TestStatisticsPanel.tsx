import {
  type InvenTreePluginContext,
  InvenTreeTable,
  useTable
} from '@inventreedb/ui';
import { BarChart } from '@mantine/charts';
import {
  ActionIcon,
  Alert,
  Group,
  Paper,
  Stack,
  Switch,
  Text
} from '@mantine/core';
import { type DateValue, MonthPickerInput } from '@mantine/dates';
import {
  IconChevronDown,
  IconChevronRight,
  IconInfoCircle
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { DataTableRowExpansionProps } from 'mantine-datatable';
import { useEffect, useMemo, useState } from 'react';

const TEST_STATISTICS_URL = 'plugin/test_statistics/statistics/';

interface MonthlyEntry {
  month: string; // "YYYY-MM-DD"
  pass_count: number;
  fail_count: number;
}

function MonthlyBarChart({
  record,
  startDate,
  endDate
}: {
  record: any;
  startDate: Date;
  endDate: Date;
}) {
  const monthMap = new Map<string, MonthlyEntry>();
  for (const m of (record.monthly ?? []) as MonthlyEntry[]) {
    monthMap.set(m.month, m);
  }

  const data: { month: string; pass: number; fail: number }[] = [];
  let current = dayjs(startDate).startOf('month');
  const end = dayjs(endDate).startOf('month');

  while (!current.isAfter(end)) {
    const key = current.format('YYYY-MM-DD');
    const entry = monthMap.get(key);
    const total_count = (entry?.pass_count ?? 0) + (entry?.fail_count ?? 0);
    const pass_percent =
      total_count > 0 ? (entry?.pass_count ?? 0) / total_count : 0;

    data.push({
      month: `${current.format('MMM YYYY')} - ${(100 * pass_percent).toFixed(1)} %`,
      pass: entry?.pass_count ?? 0,
      fail: entry?.fail_count ?? 0
    });
    current = current.add(1, 'month');
  }

  return (
    <Paper p='sm' m='sm' withBorder>
      <BarChart
        h={220}
        data={data}
        dataKey='month'
        type='stacked'
        series={[
          { name: 'pass', label: 'Pass', color: 'green.6' },
          { name: 'fail', label: 'Fail', color: 'red.6' }
        ]}
      />
    </Paper>
  );
}

function TestStatisticsPanel({ context }: { context: InvenTreePluginContext }) {
  const tableState = useTable('test-statistics-table', {
    idAccessor: 'template'
  });

  // Do we want to include variant information?
  const [includeVariants, setIncludeVariants] = useState<boolean>(false);

  // Starting date for the test history
  const [startDate, setStartDate] = useState<Date>(
    dayjs().subtract(1, 'year').toDate()
  );

  // Ending date for the order history
  const [endDate, setEndDate] = useState<Date>(
    dayjs().add(1, 'month').toDate()
  );

  useEffect(() => {
    // Whenever user options change, we want to reset the table state to trigger a reload
    tableState.refreshTable();
  }, [includeVariants, startDate, endDate]);

  const columns = useMemo(() => {
    return [
      {
        accessor: 'template_detail.test_name',
        title: 'Test Name',
        switchable: false,
        render: (record: any) => {
          return (
            <Group gap='xs' wrap='nowrap'>
              <ActionIcon size='sm' variant='transparent'>
                {tableState.isRowExpanded(record.template) ? (
                  <IconChevronDown />
                ) : (
                  <IconChevronRight />
                )}
              </ActionIcon>
              <Text>{record.template_detail.test_name}</Text>
            </Group>
          );
        }
      },
      {
        accessor: 'template_detail.description',
        title: 'Description'
      },
      {
        accessor: 'pass_count',
        title: 'Passed',
        switchable: false,
        render: (record: any) => {
          const total = record.pass_count + record.fail_count;
          const pass_pct = total > 0 ? (record.pass_count / total) * 100 : 0;

          return (
            <Group justify='space-between' wrap='nowrap'>
              <Text>{record.pass_count}</Text>
              {total > 0 && <Text size='xs'>({pass_pct.toFixed(2)}%)</Text>}
            </Group>
          );
        }
      },
      {
        accessor: 'fail_count',
        title: 'Failed',
        switchable: false,
        render: (record: any) => {
          const total = record.pass_count + record.fail_count;
          const fail_pct = total > 0 ? (record.fail_count / total) * 100 : 0;

          return (
            <Group justify='space-between' wrap='nowrap'>
              <Text>{record.fail_count}</Text>
              {total > 0 && <Text size='xs'>({fail_pct.toFixed(2)}%)</Text>}
            </Group>
          );
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
  }, [tableState.isRowExpanded]);

  const rowExpansion: DataTableRowExpansionProps<any> = useMemo(() => {
    return {
      allowMultiple: true,
      content: ({ record }: { record: any }) => (
        <MonthlyBarChart
          record={record}
          startDate={startDate}
          endDate={endDate}
        />
      )
    };
  }, [startDate, endDate]);

  return (
    <>
      <Alert color='blue' icon={<IconInfoCircle />} title='Test Statistics'>
        This panel displays statistics about the tests that have been executed.
        The data is aggregated by test template, and includes the total number
        of times each test has been executed, as well as the pass/fail counts
        and percentages.
      </Alert>
      <Paper withBorder p='sm' m='sm'>
        <Stack gap='xs'>
          <Group gap='xs'>
            <MonthPickerInput
              style={{ minWidth: '200px' }}
              value={startDate}
              label={`Start Date`}
              onChange={(value: DateValue) => {
                if (value) {
                  const newStartDate = dayjs(value).startOf('month').toDate();
                  if (newStartDate < endDate) {
                    setStartDate(newStartDate);
                  }
                }
              }}
            />

            <MonthPickerInput
              value={endDate}
              style={{ minWidth: '200px' }}
              label={`End Date`}
              onChange={(value: DateValue) => {
                if (value) {
                  const newEndDate = dayjs(value).endOf('month').toDate();
                  if (newEndDate > startDate) {
                    setEndDate(newEndDate);
                  }
                }
              }}
            />
            <Switch
              checked={includeVariants}
              onChange={(event) =>
                setIncludeVariants(event.currentTarget.checked)
              }
              label='Include Variants'
              description='Include variant parts in the statistics'
            />
          </Group>
          <InvenTreeTable
            url={TEST_STATISTICS_URL}
            tableState={tableState}
            columns={columns}
            props={{
              params: {
                ...(context.context?.filters ?? {}),
                include_variants: includeVariants,
                date_after: startDate.toISOString().split('T')[0],
                date_before: endDate.toISOString().split('T')[0]
              },
              enableSearch: false,
              rowExpansion: rowExpansion
            }}
            context={context}
          />
        </Stack>
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
export function RenderPanel(context: InvenTreePluginContext) {
  return <TestStatisticsPanel context={context} />;
}
