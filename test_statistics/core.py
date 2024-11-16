"""Test statistics plugin for InvenTree."""

from plugin import InvenTreePlugin
from plugin.mixins import SettingsMixin, UrlsMixin, UserInterfaceMixin

from .version import PLUGIN_VERSION


class TestStatisticsPlugin(SettingsMixin, UrlsMixin, UserInterfaceMixin, InvenTreePlugin):
    """Test statistics plugin for InvenTree."""

    AUTHOR = "InvenTree Contributors"
    DESCRIPTION = "Test statistics plugin for InvenTree"
    VERSION = PLUGIN_VERSION

    MIN_VERSION = '0.17.0'

    NAME = "Test Statistics"
    SLUG = "test_statistics"
    TITLE = "Test Statistics Plugin"

    SETTINGS = {}

    def setup_urls(self):
        """Returns the URLs defined by this plugin."""

        from django.urls import path
        from .views import TestStatisticsView

        return [
            path('statistics/', TestStatisticsView.as_view(), name='test-statistics'),
        ]

    def get_ui_panels(self, request, context=None, **kwargs):
        """Return the UI panels for this plugin."""

        from build.models import Build
        from part.models import Part

        user = request.user

        if not user or not user.is_authenticated:
            return []
        
        # Cache the settings for this plugin
        self.plugin_settings = self.get_settings_dict()

        valid_target = False

        stat_filters = {}

        target_model = context.get('target_model', None)
        target_id = context.get('target_id', None)

        if target_model == 'build':
            try:
                build = Build.objects.get(pk=target_id)
                part = build.part
                if part.testable:
                    valid_target = True
                    stat_filters['build'] = build.pk
            except Build.DoesNotExist:
                pass
        
        elif target_model == 'part':
            try:
                part = Part.objects.get(pk=target_id)
                if part.testable:
                    valid_target = True
                    stat_filters['part'] = part.pk
            except Part.DoesNotExist:
                pass
        
        if not valid_target:
            return []

        return [
            {
                'key': 'test-statistics',
                'title': 'Test Statistics',
                'template': 'test_statistics/panel.html',
                'source': self.plugin_static_file('TestStatisticsPanel.js:renderPanel'),
                'icon': 'ti:report-analytics:outline',
                'context': {
                    'settings': self.plugin_settings,
                    'filters': stat_filters,
                }
            }
        ]
