import { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Image } from 'expo-image';
import { withUniwind } from 'uniwind';
import { Texto as Text } from '@/components/ui/Texto';
import { useAuth } from '@/context/AuthProvider';

const StyledImage = withUniwind(Image);

export function BienvenidaAutenticacion() {
  const { cerrarBienvenida, mostrarBienvenida } = useAuth();
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.82));

  useEffect(() => {
    if (!mostrarBienvenida) return;

    opacity.setValue(0);
    scale.setValue(0.82);

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) cerrarBienvenida();
    });

    return () => animation.stop();
  }, [cerrarBienvenida, mostrarBienvenida, opacity, scale]);

  if (!mostrarBienvenida) return null;

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-[#F8FBFF] px-8">
      <Animated.View
        className="items-center"
        style={{ opacity, transform: [{ scale }] }}
      >
        <View className="mb-7 h-28 w-28 overflow-hidden rounded-[28px] border border-ruta-blue-line bg-white shadow-lg shadow-ruta-navy/10">
          <StyledImage
            source={require('../../../assets/images/app-icon.png')}
            contentFit="contain"
            className="h-full w-full"
            accessibilityLabel="Logo de RutaFix"
          />
        </View>
        <Text className="text-center text-[28px] font-extrabold tracking-tight text-ruta-navy">
          ¡Qué bueno verte!
        </Text>
        <Text className="mt-2 text-center text-base leading-6 text-ruta-blue-muted">
          Tu RutaFix está lista para seguir cuidando tu vehículo.
        </Text>
      </Animated.View>
    </View>
  );
}
