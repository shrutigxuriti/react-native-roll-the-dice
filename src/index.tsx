import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, TouchableOpacity, View } from 'react-native';

const DiceFace = ({ position, rotation, texture }: any) => (
  <mesh position={position} rotation={rotation}>
    <planeGeometry args={[1, 1]} />
    <meshStandardMaterial
      map={texture}
      side={THREE.DoubleSide}
      color={0xffffff}
      emissive={0x000000}
      roughness={1}
      metalness={0}
    />
  </mesh>
);

const Scene = ({ rolling, rollAxis, rollAngle, setRolling, setTopFace, textures, onRoll }: any) => {
  const meshRef = useRef<any>();
  const [rotationProgress, setRotationProgress] = useState(0);

  useFrame(() => {
    if (rolling && meshRef.current) {
      const rotationAmount = 0.3;
      meshRef.current.rotation.x += rollAxis.x * rotationAmount;
      meshRef.current.rotation.y += rollAxis.y * rotationAmount;
      meshRef.current.rotation.z += rollAxis.z * rotationAmount;

      setRotationProgress(prev => prev + rotationAmount);

      if (rotationProgress >= rollAngle) {
        setRolling(false);
        setRotationProgress(0);

        const alignedRotation = alignToFace(meshRef.current.rotation);
        meshRef.current.rotation.set(alignedRotation.x, alignedRotation.y, alignedRotation.z);

        const topFace = determineTopFace(meshRef.current.rotation);
        setTopFace(topFace);

        if (onRoll) {
          onRoll(topFace);
        }
      }
    }
  });

  const alignToFace = (rotation: THREE.Euler) => {
    const faces = [
      { face: 1, rotation: new THREE.Euler(0, 0, 0) },
      { face: 2, rotation: new THREE.Euler(0, Math.PI, 0) },
      { face: 3, rotation: new THREE.Euler(0, Math.PI / 2, 0) },
      { face: 4, rotation: new THREE.Euler(0, -Math.PI / 2, 0) },
      { face: 5, rotation: new THREE.Euler(Math.PI / 2, 0, 0) },
      { face: 6, rotation: new THREE.Euler(-Math.PI / 2, 0, 0) },
    ];

    const currentQuaternion = new THREE.Quaternion().setFromEuler(rotation);

    const faceToAlign = faces.reduce((closest, current) => {
      const faceQuaternion = new THREE.Quaternion().setFromEuler(current.rotation);

      const diff = currentQuaternion.angleTo(faceQuaternion);
      return diff < closest.diff ? { face: current.face, diff } : closest;
    }, { face: 1, diff: Infinity });

    return faces.find(f => f.face === faceToAlign.face)?.rotation || new THREE.Euler();
  };

  const determineTopFace = (rotation: THREE.Euler) => {
    const faces = [
      { face: 5, normal: new THREE.Vector3(0, 0, 1) },
      { face: 6, normal: new THREE.Vector3(0, 0, -1) },
      { face: 2, normal: new THREE.Vector3(1, 0, 0) },
      { face: 1, normal: new THREE.Vector3(-1, 0, 0) },
      { face: 3, normal: new THREE.Vector3(0, 1, 0) },
      { face: 4, normal: new THREE.Vector3(0, -1, 0) },
    ];

    const rotatedNormals = faces.map(({ face, normal }) => {
      const vec = normal.clone().applyEuler(rotation);
      return { face, dot: vec.dot(new THREE.Vector3(0, 0, 1)) };
    });

    const topFace = rotatedNormals.reduce((max, current) =>
      (current.dot > max.dot ? current : max),
      { face: 1, dot: -Infinity }
    );
    return topFace?.face;
  };

  return (
    <>
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} />
      <group ref={meshRef}>
        <DiceFace position={[0, 0, 0.5]} rotation={[0, 0, 0]} texture={textures[4]} />
        <DiceFace position={[0, 0, -0.5]} rotation={[0, Math.PI, 0]} texture={textures[5]} />
        <DiceFace position={[0.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} texture={textures[1]} />
        <DiceFace position={[-0.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} texture={textures[0]} />
        <DiceFace position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} texture={textures[2]} />
        <DiceFace position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} texture={textures[3]} />
      </group>
    </>
  );
};

const Dice = ({ textures, onRoll, renderCustomButton, height, width }: any) => {
  const [rolling, setRolling] = useState(false);
  const [rollAxis, setRollAxis] = useState(new THREE.Vector3(0, 1, 0));
  const [rollAngle, setRollAngle] = useState(Math.PI * 4);
  const [topFace, setTopFace] = useState<number | null>(null);

  const handleRoll = () => {
    setRolling(true);
    const axis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    const angle = Math.random() * Math.PI * 4;
    setRollAxis(axis);
    setRollAngle(angle);
  };

  return (
    <>
      <View style={{ height: height, width: width }}>
        <Canvas linear flat>
          <Scene rolling={rolling} rollAxis={rollAxis} rollAngle={rollAngle} setRolling={setRolling} setTopFace={setTopFace} textures={textures} onRoll={onRoll} />
        </Canvas>
        {renderCustomButton ? (
          renderCustomButton(handleRoll)
        ) : (
          <TouchableOpacity onPress={handleRoll}>
            <Text>Roll Dice</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

export default Dice;
