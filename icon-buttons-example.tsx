import React, { type FC } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ThemeProvider } from './src/theme';
import { ButtonGhost, ButtonOutline, ButtonRegular } from './src/ui/buttons';

const IconButtonsExample: FC = () => {
  const handlePress = (): void => {
    console.log('Button pressed!');
  };

  return (
    <ThemeProvider>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.title}>ButtonRegular with Icons</Text>

          <ButtonRegular
            iconName="send"
            iconFamily="MaterialIcons"
            onPress={handlePress}
            style={styles.button}
          >
            Send Message
          </ButtonRegular>

          <ButtonRegular
            iconName="arrow-forward"
            iconFamily="MaterialIcons"
            iconPosition="right"
            variant="secondary"
            onPress={handlePress}
            style={styles.button}
          >
            Next Step
          </ButtonRegular>

          <ButtonRegular
            iconName="download"
            iconFamily="MaterialIcons"
            variant="success"
            onPress={handlePress}
            style={styles.button}
          >
            Download
          </ButtonRegular>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>ButtonOutline with Icons</Text>

          <ButtonOutline
            iconName="edit"
            iconFamily="MaterialIcons"
            onPress={handlePress}
            style={styles.button}
          >
            Edit Profile
          </ButtonOutline>

          <ButtonOutline
            iconName="arrow-back"
            iconFamily="MaterialIcons"
            iconPosition="left"
            variant="secondary"
            onPress={handlePress}
            style={styles.button}
          >
            Go Back
          </ButtonOutline>

          <ButtonOutline
            iconName="delete"
            iconFamily="MaterialIcons"
            iconPosition="left"
            variant="danger"
            onPress={handlePress}
            style={styles.button}
          >
            Delete Item
          </ButtonOutline>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>ButtonGhost with Icons</Text>

          <ButtonGhost
            iconName="favorite"
            iconFamily="MaterialIcons"
            onPress={handlePress}
            style={styles.button}
          >
            Like
          </ButtonGhost>

          <ButtonGhost
            iconName="share"
            iconFamily="MaterialIcons"
            iconPosition="right"
            variant="secondary"
            onPress={handlePress}
            style={styles.button}
          >
            Share
          </ButtonGhost>

          <ButtonGhost
            iconName="info"
            iconFamily="MaterialIcons"
            variant="backgroundless"
            onPress={handlePress}
            style={styles.button}
          >
            More Info
          </ButtonGhost>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Loading States</Text>

          <ButtonRegular
            iconName="send"
            iconFamily="MaterialIcons"
            loading
            style={styles.button}
          >
            Sending...
          </ButtonRegular>

          <ButtonOutline
            iconName="refresh"
            iconFamily="MaterialIcons"
            loading
            style={styles.button}
          >
            Refreshing...
          </ButtonOutline>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Different Icon Families</Text>

          <ButtonRegular
            iconName="heart"
            iconFamily="Feather"
            variant="danger"
            onPress={handlePress}
            style={styles.button}
          >
            Feather Heart
          </ButtonRegular>

          <ButtonOutline
            iconName="star"
            iconFamily="AntDesign"
            variant="success"
            onPress={handlePress}
            style={styles.button}
          >
            AntDesign Star
          </ButtonOutline>

          <ButtonGhost
            iconName="home"
            iconFamily="Ionicons"
            onPress={handlePress}
            style={styles.button}
          >
            Ionicons Home
          </ButtonGhost>
        </View>
      </ScrollView>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginVertical: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  button: {
    marginVertical: 8,
  },
});

export { IconButtonsExample };
