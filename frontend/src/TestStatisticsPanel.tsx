import { MantineProvider, Paper, Text} from '@mantine/core';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';


// const TEST_STATISTICS_URL = "plugin/test_statistics/statistics/";

function TestStatisticsPanel({context}: {context: any}) {

    useEffect(() => {
        console.log("rendering with context:", context);
    }, [context]);

    return (
        <>
        <Paper withBorder p="sm" m="sm">
            <Text>Hello world</Text>
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