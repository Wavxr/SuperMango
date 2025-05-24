import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SavedTreesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<any[]>([]);

  const loadData = useCallback(() => {
    const fetchData = async () => {
      const raw = await AsyncStorage.getItem('savedRecommendations');
      setData(raw ? JSON.parse(raw) : []);
    };
    fetchData();
  }, []);

  useFocusEffect(() => {
    loadData();
  });

  const del = async (id: string) => {
    const filtered = data.filter(x => x.id !== id);
    setData(filtered);
    await AsyncStorage.setItem('savedRecommendations', JSON.stringify(filtered));
  };

  const confirmDelete = (id: string) =>
    Alert.alert('Delete?', 'Remove this tree?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => del(id) },
    ]);

  const openTree = (item: any) => {
    router.push({
      pathname: '/result',
      params: {
        ...item.payload,
        savedView: 'true', // tells result.tsx it's a saved record
      },
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => openTree(item)}>
      <Image source={{ uri: item.image }} style={styles.img} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.time}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity onPress={() => confirmDelete(item.id)}>
        <Ionicons name="trash" size={20} color="#E53E3E" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 16,
        backgroundColor: '#F5F7FA',
      }}
    >
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40 }}>
            No saved trees yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  img: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
  },
});
