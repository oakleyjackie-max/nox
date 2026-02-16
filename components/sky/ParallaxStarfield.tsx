import React, { useMemo, useEffect } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  type SharedValue,
} from "react-native-reanimated";
import { Gyroscope } from "expo-sensors";
import { generateStars } from "./StarGenerator";
import { useSkySync } from "@/hooks/useSkySync";

const STAR_COUNT = 150;
const PARALLAX_RANGE = 20; // max pixel offset from gyroscope

export function ParallaxStarfield() {
  const { width, height } = useWindowDimensions();
  const { altitude } = useSkySync();

  // Gyroscope-driven parallax offsets
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  // Slow rotation simulating Earth's rotation
  const rotation = useSharedValue(0);

  const starsVisible = altitude < 6;

  const stars = useMemo(() => generateStars(STAR_COUNT), []);

  // Start slow rotation animation
  useEffect(() => {
    if (!starsVisible) return;
    rotation.value = 0;
    rotation.value = withRepeat(
      withTiming(360, { duration: 240_000, easing: Easing.linear }),
      -1,
      false
    );
  }, [starsVisible]);

  useEffect(() => {
    if (!starsVisible) return;

    let subscription: ReturnType<typeof Gyroscope.addListener> | null = null;

    const subscribe = async () => {
      const available = await Gyroscope.isAvailableAsync().catch(() => false);
      if (!available) return;

      Gyroscope.setUpdateInterval(50);

      subscription = Gyroscope.addListener(({ x, y }) => {
        const clamp = (v: number, min: number, max: number) =>
          Math.max(min, Math.min(max, v));

        offsetX.value = withSpring(
          clamp(y * PARALLAX_RANGE, -PARALLAX_RANGE, PARALLAX_RANGE),
          { damping: 20, stiffness: 90 }
        );
        offsetY.value = withSpring(
          clamp(x * PARALLAX_RANGE, -PARALLAX_RANGE, PARALLAX_RANGE),
          { damping: 20, stiffness: 90 }
        );
      });
    };

    subscribe();

    return () => {
      subscription?.remove();
    };
  }, [starsVisible]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (!starsVisible) return null;

  // Oversize the container to prevent clipping during rotation
  const oversize = 1.4;
  const ofsX = -width * (oversize - 1) * 0.5;
  const ofsY = -height * (oversize - 1) * 0.5;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: width * oversize,
          height: height * oversize,
          left: ofsX,
          top: ofsY,
          pointerEvents: "none",
        },
        rotationStyle,
      ]}
    >
      {stars.map((star) => (
        <TwinklingStar
          key={star.id}
          x={star.x * width * oversize}
          y={star.y * height * oversize}
          size={star.size}
          baseOpacity={star.opacity}
          twinkleSpeed={star.twinkleSpeed}
          depth={star.size / 3}
          offsetX={offsetX}
          offsetY={offsetY}
        />
      ))}
    </Animated.View>
  );
}

function TwinklingStar({
  x,
  y,
  size,
  baseOpacity,
  twinkleSpeed,
  depth,
  offsetX,
  offsetY,
}: {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  depth: number;
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
}) {
  const opacity = useSharedValue(baseOpacity);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(baseOpacity * 0.3, {
        duration: twinkleSpeed,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: offsetX.value * depth },
      { translateY: offsetY.value * depth },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#ffffff",
        },
        animStyle,
      ]}
    />
  );
}
