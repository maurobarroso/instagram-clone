import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import db from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

export default function Search(props) {
  const [users, setUsers] = useState([]);

  const fetchUsers = (search) => {
    const usersRef = collection(db, "users");

    const docRef = query(usersRef, where("name", ">=", search));

    getDocs(docRef)
      .then((snapshot) => {
        let users = snapshot.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;

          return { id, ...data };
        });
        setUsers(users);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <View>
      <TextInput
        placeholder="Type Here..."
        onChangeText={(search) => fetchUsers(search)}
      />

      <FlatList
        numberColumns={1}
        horizontal={false}
        data={users}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate("Profile", { uid: item.id })
            }
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
