import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { TextureLoader } from 'three';
import Dice from 'react-native-roll-the-dice';

const diceTextures = [
  require('./assets/one.png'),
  require('./assets/two.png'),
  require('./assets/three.png'),
  require('./assets/four.png'),
  require('./assets/five.png'),
  require('./assets/six.png')
];

export default function App() {

  const [textures, setTextures] = useState(null);

  useEffect(() => {
    const loadTextures = async () => {
      const loadedTextures = await Promise.all(diceTextures.map(texture => new TextureLoader().loadAsync(texture)));
      if (loadedTextures) {
        setTextures(loadedTextures);
      }
    };

    loadTextures();
  }, []);

  const CustomButton = (handleRoll: () => void) => (
    <TouchableOpacity onPress={handleRoll} style={{ backgroundColor: 'blue', padding: 10 }}>
      <Text style={{ color: 'white' }}>Custom Roll Button</Text>
    </TouchableOpacity>
  );

  const handleDiceRoll = (winningFace: number) => {
    console.log('Winning face:', winningFace);
  };

  if (!textures) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Dice height={400} width={400} textures={textures} onRoll={handleDiceRoll} renderCustomButton={CustomButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glView: {
    flex: 1,
  },
});
