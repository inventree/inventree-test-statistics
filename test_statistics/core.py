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

        user = request.user

        if not user or not user.is_authenticated:
            return []
        
        # Cache the settings for this plugin
        self.plugin_settings = self.get_settings_dict()

        # TODO: Define the UI panels for this plugin
        return []