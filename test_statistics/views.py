"""API views for the test statistics plugin."""

from datetime import date
from typing import cast

from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from . import serializers


class TestStatisticsView(APIView):
    """View for generating test statistics data."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Generate test statistics data based on the provided parameters."""
        # Extract filter parameters from the request
        serializer = serializers.TestStatisticsRequestSerializer(
            data=request.query_params
        )
        serializer.is_valid(raise_exception=True)

        params = cast(dict, serializer.validated_data)

        templates = self.filter_templates(**params)
        results = self.filter_results(**params)

        # Map each result to the corresponding template
        template_data = {}

        for template in templates:
            template_data[template.pk] = {
                'template': template,
                'pass_count': 0,
                'fail_count': 0,
                'monthly_data': {},
            }

        for result in results:
            if result.template.pk not in template_data:
                template_data[result.template.pk] = {
                    'template': result.template,
                    'pass_count': 0,
                    'fail_count': 0,
                    'monthly_data': {},
                }

            entry = template_data[result.template.pk]

            if result.result:
                entry['pass_count'] += 1
            else:
                entry['fail_count'] += 1

            if result.date:
                month_key = date(result.date.year, result.date.month, 1)
                monthly = entry['monthly_data']
                if month_key not in monthly:
                    monthly[month_key] = {'pass_count': 0, 'fail_count': 0}
                if result.result:
                    monthly[month_key]['pass_count'] += 1
                else:
                    monthly[month_key]['fail_count'] += 1

        # Convert monthly_data dicts to sorted lists for serialization
        for entry in template_data.values():
            monthly_data = entry.pop('monthly_data')
            entry['monthly'] = [
                {'month': month, **counts}
                for month, counts in sorted(monthly_data.items())
            ]

        # Serialize the results
        template_list = list(template_data.values())

        data = serializers.TestStatisticsSerializer(template_list, many=True).data

        return Response(data)

    def filter_templates(self, **kwargs):
        """Generate a list of 'expected' test templates pased on the provided parameters."""
        from part.models import PartTestTemplate

        templates = PartTestTemplate.objects.all()

        # Only allow test templates which are enabled
        templates = templates.filter(enabled=True)

        # Filter by Part
        if part := kwargs.get('part'):
            include_variants = kwargs.get('include_variants', False)

            if include_variants:
                templates = templates.filter(
                    part__in=part.get_descendants(include_self=True)
                )
            else:
                templates = templates.filter(part=part)

        # Filter by Build Order
        if build := kwargs.get('build'):
            if part := build.part:
                templates = templates.filter(part=part)

        return templates

    def filter_results(self, **kwargs):
        """Filter the StockItemTestResult queryset based on the provided parameters.

        Keyword Arguments:
            part: Filter by Part
            stock_item: Filter by StockItem
            build: Filter by Build Order
            date_before: Filter by test result date (before)
            date_after: Filter by test result date (after)
            started_after: Filter by test start date (after)
            started_before: Filter by test start date (before)
            finished_after: Filter by test completion date (after)
            finished_before: Filter by test completion date (before)
        """
        from stock.models import StockItemTestResult

        queryset = StockItemTestResult.objects.all()

        # Filter by Part
        if part := kwargs.get('part'):
            include_variants = kwargs.get('include_variants', False)

            if include_variants:
                queryset = queryset.filter(
                    stock_item__part__in=part.get_descendants(include_self=True)
                )
            else:
                queryset = queryset.filter(stock_item__part=part)

        # Filter by Build Order
        if build := kwargs.get('build'):
            queryset = queryset.filter(stock_item__build=build)

            # Also filter by part if provided
            if part := build.part:
                queryset = queryset.filter(stock_item__part=part)

        # Filter by Stock Item
        if stock_item := kwargs.get('stock_item'):
            queryset = queryset.filter(stock_item=stock_item)

        # Filter by primary test result date (e.g. test completion date)
        if date_after := kwargs.get('date_after'):
            queryset = queryset.filter(date__gte=date_after)

        if date_before := kwargs.get('date_before'):
            queryset = queryset.filter(date__lte=date_before)

        # Filter by started date
        if started_after := kwargs.get('started_after'):
            queryset = queryset.filter(started__gte=started_after)

        if started_before := kwargs.get('started_before'):
            queryset = queryset.filter(started__lte=started_before)

        # Filter by finished date
        if finished_after := kwargs.get('finished_after'):
            queryset = queryset.filter(finished__gte=finished_after)

        if finished_before := kwargs.get('finished_before'):
            queryset = queryset.filter(finished__lte=finished_before)

        # Prefetch related fields
        queryset = queryset.select_related('template')

        return queryset
