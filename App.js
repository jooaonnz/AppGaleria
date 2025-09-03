import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function App() {
  // Estado para armazenar as fotos da galeria
  const [photos, setPhotos] = useState([
    {
      id: '1',
      url: 'https://picsum.photos/id/1011/300/200',
      caption: 'Paisagem bonita',
    },
    {
      id: '2',
      url: 'https://picsum.photos/id/1012/300/200',
      caption: 'Montanhas ao entardecer',
    },
  ]);

  // Estado para controlar qual tela está ativa: 'list' ou 'add'
  const [screen, setScreen] = useState('list');

  // Estados para os inputs do formulário
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');

  // Função para adicionar nova foto
  const addPhoto = () => {
    if (newUrl.trim() === '' || newCaption.trim() === '') {
      alert('Por favor, preencha a URL e a legenda.');
      return;
    }

    const newPhoto = {
      id: (photos.length + 1).toString(),
      url: newUrl.trim(),
      caption: newCaption.trim(),
    };

    setPhotos([newPhoto, ...photos]); // adiciona no topo da lista
    setNewUrl('');
    setNewCaption('');
    setScreen('list'); // volta para a lista
  };

  // Renderiza cada item da FlatList
  const renderItem = ({ item }) => (
    <View style={styles.photoContainer}>
      <Image source={{ uri: item.url }} style={styles.photo} />
      <Text style={styles.caption}>{item.caption}</Text>
    </View>
  );

  if (screen === 'list') {
    // Tela de listagem da galeria
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Galeria de Fotos</Text>
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => setScreen('add')}
        >
          <Text style={styles.buttonText}>Adicionar Nova Foto</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    // Tela de cadastro de nova foto
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Cadastrar Nova Foto</Text>

          <Text style={styles.label}>URL da Imagem:</Text>
          <TextInput
            style={styles.input}
            placeholder="Cole a URL da imagem aqui"
            value={newUrl}
            onChangeText={setNewUrl}
            autoCapitalize="none"
            keyboardType="url"
          />

          <Text style={styles.label}>Legenda:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a legenda da foto"
            value={newCaption}
            onChangeText={setNewCaption}
          />

          <TouchableOpacity style={styles.button} onPress={addPhoto}>
            <Text style={styles.buttonText}>Salvar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#888', marginTop: 10 }]}
            onPress={() => setScreen('list')}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  photoContainer: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  photo: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  caption: {
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

