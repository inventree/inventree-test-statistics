"""DRF API serializers for the Test Statistics plugin."""

from rest_framework import serializers

from build.models import Build
from part.models import Part, PartTestTemplate
from part.serializers import PartTestTemplateSerializer
from stock.models import StockItem


class TestStatisticsRequestSerializer(serializers.Serializer):
    """Serializer for requesting test statistics data from the TestStatistics plugin."""

    class Meta:
        fields = [
            'template',
            'part',
            'include_variants',
            'build',
            'stock_item',
            'started_before',
            'started_after',
            'finished_before',
            'finished_after',
        ]

    template = serializers.PrimaryKeyRelatedField(queryset=PartTestTemplate.objects.all(), many=False, required=False, label='Template')
    part = serializers.PrimaryKeyRelatedField(queryset=Part.objects.all(), many=False, required=False, label='Part')
    include_variants = serializers.BooleanField(required=False, label='Include Variants', default=False)
    build = serializers.PrimaryKeyRelatedField(queryset=Build.objects.all(), many=False, required=False, label='Build Order')
    stock_item = serializers.PrimaryKeyRelatedField(queryset=StockItem.objects.all(), many=False, required=False, label='Stock Item')

    started_before = serializers.DateTimeField(required=False, label='Started Before')
    started_after = serializers.DateTimeField(required=False, label='Started After')
    finished_before = serializers.DateTimeField(required=False, label='Finished Before')
    finished_after = serializers.DateTimeField(required=False, label='Finished After')


class TestStatisticsSerializer(serializers.Serializer):
    """Serializer for encoding test statistics results for the TestStatistics plugin."""

    class Meta:
        """Meta class for the TestStatisticsSerializer."""

        fields = [
            'template',
            'template_detail',
            'pass_count',
            'fail_count',
        ]

    template = serializers.PrimaryKeyRelatedField(label='Template ID', read_only=True)
    pass_count = serializers.IntegerField(label='Pass Count', read_only=True)
    fail_count = serializers.IntegerField(label='Fail Count', read_only=True)

    template_detail = PartTestTemplateSerializer(label='Template Detail', source='template', read_only=True)
