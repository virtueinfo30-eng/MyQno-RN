import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { theme } from '../theme';
import { fetchPlacesVisited } from '../api';

export const PlacesVisitedScreen = () => {
  const [places, setPlaces] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async (search = '') => {
    setLoading(true);
    const result = await fetchPlacesVisited(1, 100, search);
    console.log('Places Result:', result);
    setLoading(false);

    if (result.success) {
      setPlaces(result.data);
    } else {
      setPlaces([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlaces(searchText);
    setRefreshing(false);
  };

  const handleSearch = () => {
    loadPlaces(searchText);
  };

  const renderPlaceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.placeCard}
      onPress={() =>
        navigation.navigate('ConfirmToken', {
          companyLocationId: item.company_locations_id,
          companyName: item.company_name,
          noOfPersons: '1',
        })
      }
    >
      <View style={styles.placeHeader}>
        <Text style={styles.companyName}>{item.company_name}</Text>
        {item.category_name && (
          <Text style={styles.categoryBadge}>{item.category_name}</Text>
        )}
      </View>

      {item.location_name && (
        <Text style={styles.locationText}>{item.location_name}</Text>
      )}

      <View style={styles.placeDetails}>
        {item.address && (
          <Text style={styles.detailText} numberOfLines={2}>
            📍 {item.address}
          </Text>
        )}
        {item.distance && (
          <Text style={styles.detailText}>📏 {item.distance}</Text>
        )}
      </View>

      {item.last_visited_date && (
        <Text style={styles.visitedDate}>
          Last visited: {item.last_visited_date}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search visited places..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Places List */}
      <FlatList
        data={places}
        renderItem={renderPlaceItem}
        keyExtractor={(item, index) =>
          item.company_locations_id || `place_${index}`
        }
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏢</Text>
            <Text style={styles.emptyText}>
              {loading ? 'Loading...' : 'No places visited yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              Places you visit will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.white,
    gap: theme.spacing.s,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    fontSize: theme.fontSize.medium,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.l,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: theme.spacing.m,
  },
  placeCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.s,
  },
  companyName: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.s,
  },
  categoryBadge: {
    fontSize: theme.fontSize.small,
    color: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.s,
  },
  locationText: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
    fontWeight: '500',
  },
  placeDetails: {
    marginTop: theme.spacing.s,
    paddingTop: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  detailText: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  visitedDate: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.s,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.l,
  },
  emptyText: {
    fontSize: theme.fontSize.large,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
  },
  emptySubtext: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.textSecondary,
    opacity: 0.7,
  },
});
