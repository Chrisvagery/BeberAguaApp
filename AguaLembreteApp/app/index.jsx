
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Text, Alert, TouchableOpacity } from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AguaContador from "../components/agua_contador";
import {
  setupNotifications,
  updateNotifications,
} from "../utils/notifications";
import { useTheme } from "../utils/ThemeContext";

const HISTORICO_AGUA = "waterHistory"; // Mesma chave usada no componente AguaContador

export default function HomeScreen() {
  const { theme } = useTheme();
  const [copos, setCopos] = useState(0);
  const [userName, setUserName] = useState("");
  const [meta, setMeta] = useState(0) ;


  useEffect(() => {
    const initialize = async () => {
      await setupNotifications();
      await carregar();
      await updateNotifications();
    };
    initialize();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const recarregarAoVoltar = async () => {
        await carregar();
      };
      recarregarAoVoltar();
    }, [])
  );

  const carregar = async () => {
    
    try {
      const historico_salvo = await AsyncStorage.getItem(HISTORICO_AGUA);
      const historico_parsed = historico_salvo
        ? JSON.parse(historico_salvo)
        : [];
      const dtAtual = new Date().toLocaleDateString("pt-BR");
      const coposHoje = historico_parsed.find(
        (entry) => entry.date === dtAtual
      );
      setCopos(coposHoje ? coposHoje.count : 0);
      const settings = await AsyncStorage.getItem(
        "beberagua:notificationSettings"
      );
      if (settings) {
        const parsed = JSON.parse(settings);
        setUserName(parsed.name || "");
        setMeta(typeof parsed.meta === "number" ? parsed.meta : 0);

        //setMeta(parsed.meta || 0 );
      }
    } catch (e) {
      console.error("Erro ao carregar contagem do dia:", e);
    }
  };

  const resetarHoje = async () => {
    try {
      const historico_salvo = await AsyncStorage.getItem("waterHistory");
      const historico = historico_salvo ? JSON.parse(historico_salvo) : [];
      const dtAtual = new Date().toLocaleDateString("pt-BR");

      const novoHistorico = historico.map((item) =>
        item.date === dtAtual ? { ...item, count: 0 } : item
      );

      await AsyncStorage.setItem("waterHistory", JSON.stringify(novoHistorico));
      setCopos(0);
    } catch (e) {
      console.error("Erro ao resetar contador do dia:", e);
    }
  };

  const mostrarAjuda = () => {
    Alert.alert(
      "Como usar o app 💧",
      "• Toque em 'Bebi um copo!' para registrar seu consumo de água.\n" +
        "• Acompanhe o histórico na aba 'Histórico'.\n" +
        "• Configure notificações, tema, nome e meta diária na aba 'Configurações'.\n" +
        "• Use o botão 'Reiniciar o Dia' para zerar os copos de hoje (sem apagar o histórico).\n" +
        "• Para voltar à tela inicial, toque no ícone 🏠 no menu inferior.\n" +
        "• Obrigado por usar nosso App 💧",
      [{ text: "Entendi", style: "default" }]
    );
  };


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primaryDark }]}>
        Lembrete de Água
      </Text>

      <AguaContador copos={copos} setCopos={setCopos} meta={meta} />

      <TouchableOpacity onPress={resetarHoje} style={styles.resetButton}>
        <Text style={styles.resetText}>Reiniciar o Dia</Text>
      </TouchableOpacity>

      {userName ? (
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Olá, {userName}! Vamos nos hidratar hoje? 💧
        </Text>
      ) : null}

      <Text style={[styles.progress, { color: theme.primary }]}>
        {meta && meta > 0 ? `${copos} / ${meta} copos` : `${copos} copos`}
      </Text>
      <TouchableOpacity onPress={mostrarAjuda} style={styles.botaoAjuda}>
        <Text style={styles.textoAjuda}>❓</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  progress: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  resetButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 12,
    backgroundColor: "#809eff",
    borderRadius: 8,
    alignSelf: "center",
  },
  resetText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  botaoAjuda: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#2196F3",
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  textoAjuda: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});