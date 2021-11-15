import React, { useState } from "react";
import { View, TextInput, Image, Button } from "react-native";

import { getAuth } from "firebase/auth";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  setDoc,
  serverTimestamp,
  doc,
  collection,
  addDoc,
} from "firebase/firestore";
import db from "../../firebase/firebaseConfig";

export default function Save(props) {
  const [caption, setCaption] = useState("");

  const uploadImage = async () => {
    const uri = props.route.params.image;
    const response = await fetch(uri);
    const blob = await response.blob();

    const auth = getAuth();

    const childPath = `posts/${auth.currentUser.uid}/${Math.random().toString(
      36
    )}`;

    console.log(childPath);

    const storage = getStorage();
    const storageRef = ref(storage, childPath);

    // 'file' comes from the Blob or File API
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        // Handle unsuccessful uploads
      },
      () => {
        // Al momento de cargar la foto guardamos la misma

        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);
          savePostData(downloadURL);
        });
      }
    );
  };

  const savePostData = async (downloadURL) => {
    const auth = getAuth();
    //const childPath = `userPosts/${auth.currentUser.uid}/posts`;

    // Resuelto el tema de los documentos anidados
    // Debemos ver el tema de traer post por orden y continuar con la app
    const userPosts = collection(db, `posts/${auth.currentUser.uid}/userPosts`);

    await addDoc(userPosts, {
      downloadURL,
      caption,
      creation: serverTimestamp(),
    })
      .then(() => {
        props.navigation.popToTop();
      })
      .catch((err) => {
        console.log("Error");
        console.log(err);
      });
  };

  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: props.route.params.image }} />
      <TextInput
        placeholder="Write a Captions . . ."
        onChangeText={(caption) => {
          setCaption(caption);
        }}
      />
      <Button title="Save" onPress={() => uploadImage()} />
    </View>
  );
}
