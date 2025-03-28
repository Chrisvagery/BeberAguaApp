import React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../utils/ThemeContext";
import { Audio } from "expo-av";

const HISTORICO_AGUA = "waterHistory";

export default function AguaContador({ copos, setCopos, meta }) {
  const { theme } = useTheme();

  const adicionar = async () => {
    const dtAtual = new Date().toLocaleDateString("pt-BR");
    
    // if (meta > 0 && copos >= meta) {
    //   return;
    // }

    // setCopos(copos + 1);
    if (typeof meta === "number" && meta > 0 && copos >= meta) {
      return;
    }

    setCopos((prev) => prev + 1);
    

    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/gota1.mp3")
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.error("Erro ao tocar som:", e);
    }

    try {
      const historico = await AsyncStorage.getItem(HISTORICO_AGUA);
      const lista = historico ? JSON.parse(historico) : [];
      const coposHoje = lista.find((entry) => entry.date === dtAtual);
      if (coposHoje) {
        coposHoje.count += 1;
      } else {
        lista.push({ date: dtAtual, count: 1 });
      }
      await AsyncStorage.setItem(HISTORICO_AGUA, JSON.stringify(lista));
    } catch (e) {
      console.error("Erro ao salvar histórico:", e);
    }
  };

  return (
    <View
      style={[styles.counterCard, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.cardContent}>
        <Text style={[styles.counterText, { color: theme.primaryDark }]}>
          Copos Hoje
        </Text>
        <Button
          title="Bebi um copo!"
          onPress={adicionar}
          color={theme.primary}
        />
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.counter}> 💧</Text>
      </View>

      <Text style={[styles.progresso, { color: theme.secondaryText }]}>
        {meta && meta > 0 ? `${copos} / ${meta} copos` : `${copos} copos`} 
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  counterCard: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardContent: {
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  counter: {
    fontSize: 46,
    fontWeight: "bold",
  },
  counterText: {
    fontSize: 24,
    fontWeight: "600",
  },
  progresso: {
    fontSize: 18,
    marginTop: 10,
  },
});

