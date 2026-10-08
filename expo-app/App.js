import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  BackHandler,
  Platform,
  StatusBar,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { WebView } from 'react-native-webview';

// Default Live App URL for Digital Bazar Peshawar
const DEFAULT_URL = 'https://ais-pre-rbxgtonh3pt6kumouxybge-197941125907.asia-southeast1.run.app';

export default function App() {
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const webViewRef = useRef(null);

  // Handle Android Hardware Back Button
  useEffect(() => {
    if (Platform.OS === 'android') {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true; // prevent default exit
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }
  }, [canGoBack]);

  const handleReload = () => {
    setHasError(false);
    setLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />

      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>ڈجیٹل بازار پشاور</Text>
          <Text style={styles.errorSubTitle}>Connection Error / انٹرنیٹ کا مسئلہ</Text>
          <Text style={styles.errorText}>
            Unable to connect to Digital Bazar server. Please check your internet connection and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
            <Text style={styles.retryButtonText}>دوبارہ کوشش کریں (Retry)</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: DEFAULT_URL }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          geolocationEnabled={true}
          allowsBackForwardNavigationGestures={true}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => setHasError(true)}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoText}>ڈجیٹل بازار</Text>
                <Text style={styles.logoSubText}>PESHAWAR</Text>
              </View>
              <ActivityIndicator size="large" color="#C5A059" style={styles.spinner} />
              <Text style={styles.loadingText}>Loading Digital Bazar Peshawar...</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F'
  },
  webview: {
    flex: 1,
    backgroundColor: '#0F0F0F'
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99
  },
  logoBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(197, 160, 89, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.4)',
    alignItems: 'center',
    marginBottom: 20
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  logoSubText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#C5A059',
    letterSpacing: 2,
    marginTop: 4
  },
  spinner: {
    marginVertical: 10
  },
  loadingText: {
    color: '#A3A3A3',
    fontSize: 12,
    marginTop: 8
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  errorTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6
  },
  errorSubTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C5A059',
    marginBottom: 12
  },
  errorText: {
    fontSize: 13,
    color: '#A3A3A3',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  retryButton: {
    backgroundColor: '#C5A059',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    elevation: 3
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold'
  }
});
