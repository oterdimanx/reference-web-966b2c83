export const worldViewPage = {
  title: "Données Géographiques",
  description: "Visualisez d'où viennent les visiteurs de votre site web dans le monde",
  noData: "Aucune Donnée d'Événement Disponible",
  noDataDescription: "Vous devez avoir des sites web avec des événements suivis pour voir cette page d'analytics.",
  loading: "Chargement des analytics mondiales...",
  error: "Erreur lors du chargement des données de vue mondiale",
  filters: {
    allTime: "Tout le Temps",
    dateRange: "Plage de Dates",
    from: "De",
    to: "À",
    apply: "Appliquer le Filtre",
    eventTypes: "Types d'Événements",
    allEvents: "Tous les Événements",
    pageviews: "Pages Vues",
    clicks: "Clics"
  },
  stats: {
    totalEvents: "Événements Totaux",
    countries: "Pays",
    topCountry: "Premier Pays",
    noCountryData: "Aucune donnée de pays disponible"
  },
  filter: {
    websites: 'Filtre par site web',
    allWebsites: 'Tous les sites web',
    filterActive: 'Filtre actif - affichage des données pour le site sélectionné uniquement',
    loadingWebsites: 'Chargement des sites web...',
  },
  map: {
    tooltip: {
      country: "Pays",
      events: "événements",
      pageviews: "pages vues",
      clicks: "clics"
    }
  },
  legend: {
    title: "Densité d'Événements",
    low: "1-10 événements",
    medium: "11-50 événements",
    high: "51+ événements"
  }
};