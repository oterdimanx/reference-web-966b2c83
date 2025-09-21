export const worldViewPage = {
  title: "World View",
  description: "Visualize where your website visitors are coming from around the world",
  noData: "No Event Data Available",
  noDataDescription: "You need to have websites with tracked events to view this analytics page.",
  loading: "Mapping your global reach...",
  error: "Error loading world view data",
  filters: {
    allTime: "All Time",
    dateRange: "Date Range",
    from: "From",
    to: "To",
    apply: "Apply Filter",
    eventTypes: "Event Types",
    allEvents: "All Events",
    pageviews: "Pageviews",
    clicks: "Clicks"
  },
  stats: {
    totalEvents: "Total Events",
    countries: "Countries",
    topCountry: "Top Country",
    noCountryData: "No country data available"
  },
  filter: {
    websites: 'Website Filter',
    allWebsites: 'All Websites',
    filterActive: 'Filter is active - showing data for selected website only',
    loadingWebsites: 'Loading websites...',
  },
  map: {
    tooltip: {
      country: "Country",
      events: "events",
      pageviews: "pageviews", 
      clicks: "clicks"
    }
  },
  legend: {
    title: "Event Density",
    low: "1-10 events",
    medium: "11-50 events", 
    high: "51+ events"
  }
};