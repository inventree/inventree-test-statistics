"""API views for the test statistics plugin."""

from typing import cast

from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.views import APIView

from . import serializers


class TestStatisticsView(APIView):
    """View for generating test statistics data."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Generate test statistics data based on the provided parameters."""

        # Extract filter parameters from the request
        serializer = serializers.TestStatisticsRequestSerializer(data=request.query_params)
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
            }

        for result in results:
            if result.template.pk not in template_data:
                template_data[result.template.pk] = {
                    'template': result.template,
                    'pass_count': 0,
                    'fail_count': 0,
                }

            if result.result:
                template_data[result.template.pk]['pass_count'] += 1
            else:
                template_data[result.template.pk]['fail_count'] += 1

        # Serialize the results
        template_list = list(template_data.values())

        data = serializers.TestStatisticsSerializer(template_list, many=True).data

        return Response(data)

    def filter_templates(self, **kwargs):
        """Generate a list of 'expected' test templates pased on the provided parameters."""

        from part.models import PartTestTemplate

        templates = PartTestTemplate.objects.all()

        # Filter by Part
        if part := kwargs.get('part'):

            include_variants = kwargs.get('include_variants', False)

            if include_variants:
                templates = templates.filter(part__in=part.get_descendants(include_self=True))
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
                queryset = queryset.filter(stock_item__part__in=part.get_descendants(include_self=True))
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
        queryset = queryset.select_related(
            'template',
        )

        return queryset
