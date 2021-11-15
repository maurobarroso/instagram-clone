import React, { Component } from "react";
import { View, Button, TextInput } from "react-native";

import db from "../../firebase/firebaseConfig";

// Firestore
import { doc, setDoc } from "firebase/firestore";
// Write methods
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

export class Register extends Component {
  // Constructor que recibirá las props iniciales en un estado
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      name: "",
    };

    this.onSignUp = this.onSignUp.bind(this);
  }

  // Metodo para realizar el signup, Agrega un usuario del
  // estado mediante createUserWithEmailAndPassword()
  onSignUp() {
    const { email, password, name } = this.state;

    const auth = getAuth();

    createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        setDoc(doc(db, "users", auth.currentUser.uid), {
          name,
          email,
        });

        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <View>
        <TextInput
          style={{ marginTop: 100 }}
          placeholder="name"
          onChangeText={(name) => this.setState({ name })}
        />
        <TextInput
          placeholder="email"
          onChangeText={(email) => this.setState({ email })}
        />
        <TextInput
          placeholder="password"
          secureTextEntry={true}
          onChangeText={(password) => this.setState({ password })}
        />

        <Button onPress={() => this.onSignUp()} title="Sign Up" />
      </View>
    );
  }
}

export default Register;
