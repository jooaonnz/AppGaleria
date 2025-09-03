// App.js
import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  ScrollView,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// -----------------------------
// Contexto para gerenciar a galeria
// -----------------------------
const GalleryContext = createContext(null);

function useGallery() {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error('useGallery deve ser usado dentro de <GalleryProvider />');
  return ctx;
}

function GalleryProvider({ children }) {
  const [photos, setPhotos] = useState([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
      caption: 'Montanhas ao amanhecer',
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
      caption: 'Cidade à noite',
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
    },
  ]);

  const addPhoto = (url, caption) => {
    const newPhoto = {
      id: String(Date.now()),
      url: url.trim(),
      caption: caption.trim(),
      createdAt: Date.now(),
    };
    setPhotos(prev => [newPhoto, ...prev]);
  };

  const removePhoto = (id) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const updatePhoto = (id, newUrl, newCaption) => {
    setPhotos(prev =>
      prev.map(photo =>
        photo.id === id
          ? { ...photo, url: newUrl.trim(), caption: newCaption.trim() }
          : photo
      )
    );
  };

  const value = useMemo(() => ({ photos, addPhoto, removePhoto, updatePhoto }), [photos]);
  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
}

// -----------------------------
// Tela 1: Listagem da Galeria
// -----------------------------
function GalleryScreen({ navigation }) {
  const { photos } = useGallery();

  const sorted = useMemo(
    () => [...photos].sort((a, b) => b.createdAt - a.createdAt),
    [photos]
  );

  const renderItem = ({ item }) => (
    <PhotoItem item={item} navigation={navigation} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minha Galeria</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('AddPhoto')}
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        >
          <Text style={styles.addButtonText}>+ Nova Foto</Text>
        </Pressable>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function PhotoItem({ item, navigation }) {
  const { removePhoto } = useGallery();
  const [failed, setFailed] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Remover Foto',
      'Tem certeza que deseja remover esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removePhoto(item.id) },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {failed || !item.url ? (
        <View style={[styles.image, styles.imageFallback]}>
          <Text style={styles.fallbackText}>Imagem indisponível</Text>
        </View>
      ) : (
        <Image
          source={{ uri: item.url }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      )}

      <Text style={styles.caption}>{item.caption || 'Sem legenda'}</Text>
      <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>

      <View style={styles.actionRow}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: '#1f6feb' }]}
          onPress={() => navigation.navigate('EditPhoto', { photo: item })}
        >
          <Text style={styles.actionButtonText}>Editar</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, { backgroundColor: '#e63946' }]}
          onPress={handleDelete}
        >
          <Text style={styles.actionButtonText}>Remover</Text>
        </Pressable>
      </View>
    </View>
  );
}

// -----------------------------
// Tela 2: Adicionar nova foto
// -----------------------------
function AddPhotoScreen({ navigation }) {
  const { addPhoto } = useGallery();
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [previewOk, setPreviewOk] = useState(true);

  const isValidUrl = (value) => /^https?:\/\//i.test(value.trim());

  const handleSave = () => {
    if (!isValidUrl(url)) {
      Alert.alert('URL inválida', 'Informe uma URL iniciando com http(s)://');
      return;
    }
    if (!caption.trim()) {
      Alert.alert('Legenda obrigatória', 'Digite uma legenda para a foto.');
      return;
    }

    addPhoto(url, caption);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.formTitle}>Cadastrar nova foto</Text>

        <Text style={styles.label}>URL da imagem</Text>
        <TextInput
          placeholder="https://..."
          value={url}
          onChangeText={(t) => { setUrl(t); setPreviewOk(true); }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={styles.input}
        />

        {!!url && (
          <View style={styles.previewBox}>
            {previewOk && isValidUrl(url) ? (
              <Image
                source={{ uri: url }}
                style={styles.previewImage}
                resizeMode="cover"
                onError={() => setPreviewOk(false)}
              />
            ) : (
              <View style={[styles.previewImage, styles.imageFallback]}>
                <Text style={styles.fallbackText}>Não foi possível carregar a prévia</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.label}>Legenda</Text>
        <TextInput
          placeholder="Digite uma legenda curta"
          value={caption}
          onChangeText={setCaption}
          style={[styles.input, { height: 56 }]}
        />

        <Pressable
          accessibilityRole="button"
          onPress={handleSave}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        >
          <Text style={styles.primaryButtonText}>Salvar</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// -----------------------------
// Tela 3: Editar foto existente
// -----------------------------
function EditPhotoScreen({ route, navigation }) {
  const { updatePhoto } = useGallery();
  const { photo } = route.params;

  const [url, setUrl] = useState(photo.url);
  const [caption, setCaption] = useState(photo.caption);
  const [previewOk, setPreviewOk] = useState(true);

  const isValidUrl = (value) => /^https?:\/\//i.test(value.trim());

  const handleUpdate = () => {
    if (!isValidUrl(url)) {
      Alert.alert('URL inválida', 'Informe uma URL iniciando com http(s)://');
      return;
    }
    if (!caption.trim()) {
      Alert.alert('Legenda obrigatória', 'Digite uma legenda para a foto.');
      return;
    }

    updatePhoto(photo.id, url, caption);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.formTitle}>Editar Foto</Text>

        <Text style={styles.label}>URL da imagem</Text>
        <TextInput
          placeholder="https://..."
          value={url}
          onChangeText={(t) => { setUrl(t); setPreviewOk(true); }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={styles.input}
        />

        {!!url && (
          <View style={styles.previewBox}>
            {previewOk && isValidUrl(url) ? (
              <Image
                source={{ uri: url }}
                style={styles.previewImage}
                resizeMode="cover"
                onError={() => setPreviewOk(false)}
              />
            ) : (
              <View style={[styles.previewImage, styles.imageFallback]}>
                <Text style={styles.fallbackText}>Não foi possível carregar a prévia</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.label}>Legenda</Text>
        <TextInput
          placeholder="Digite uma legenda curta"
          value={caption}
          onChangeText={setCaption}
          style={[styles.input, { height: 56 }]}
        />

        <Pressable
          accessibilityRole="button"
          onPress={handleUpdate}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        >
          <Text style={styles.primaryButtonText}>Salvar Alterações</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// -----------------------------
// Navegação
// -----------------------------
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GalleryProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Gallery" component={GalleryScreen} options={{ title: 'Galeria' }} />
          <Stack.Screen name="AddPhoto" component={AddPhotoScreen} options={{ title: 'Nova Foto' }} />
          <Stack.Screen name="EditPhoto" component={EditPhotoScreen} options={{ title: 'Editar Foto' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </GalleryProvider>
  );
}

// -----------------------------
// Estilos
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0c0f',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: '#1f6feb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonPressed: { opacity: 0.85 },
  addButtonText: { color: 'white', fontWeight: '700' },

  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#11131a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#23262f',
  },
  image: { width: '100%', height: 200, backgroundColor: '#0f1117' },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: { color: '#c2c7d0', fontSize: 12 },
  caption: {
    color: 'white',
    paddingHorizontal: 14,
    paddingTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: '#aab1bd',
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 2,
    fontSize: 12,
  },

  formContainer: {
    padding: 16,
    gap: 12,
    backgroundColor: '#0b0c0f',
    flexGrow: 1,
  },
  formTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  label: { color: '#c2c7d0', fontSize: 14 },
  input: {
    backgroundColor: '#11131a',
    borderColor: '#23262f',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: 'white',
  },
  previewBox: {
    borderWidth: 1,
    borderColor: '#23262f',
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: 220, backgroundColor: '#0f1117' },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#1f6feb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonPressed: { opacity: 0.9 },
  primaryButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
