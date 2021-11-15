import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import React, { useState, useEffect } from "react";

import { StyleSheet, View, Text, Image, FlatList, Button } from "react-native";

import { connect } from "react-redux";
import db from "../../firebase/firebaseConfig";

function Profile(props) {
  const [userPost, setUserPost] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    const { currentUser, posts } = props;

    if (props.route.params.uid === auth.currentUser.uid) {
      setUser(currentUser);
      setUserPost(posts);
    } else {
      const docRef = doc(db, "users", props.route.params.uid);

      getDoc(docRef)
        .then((snapshot) => {
          if (snapshot.exists) {
            // Aca verificamos si tenemos al usuario logueado
            setUser(snapshot.data());
          } else {
            console.log("does not exist");
          }
        })
        .catch((err) => {
          console.log(err);
        });

      const myDocument = doc(db, "posts", props.route.params.uid);
      const docPostRef = query(
        collection(myDocument, "userPosts"),
        orderBy("creation", "asc")
      );

      getDocs(docPostRef)
        .then((snapshot) => {
          let posts = snapshot.docs.map((doc) => {
            const data = doc.data();
            const id = doc.id;

            return { id, ...data };
          });

          setUserPost(posts);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    // Verifica la existencia del estado dentro de las props
    if (props.following.indexOf(props.route.params.uid) > -1) {
      setFollowing(true);
    } else {
      setFollowing(false);
    }
  }, [props.route.params.uid, props.following]);

  const onFollow = () => {
    const auth = getAuth();

    setDoc(
      doc(
        db,
        "following",
        auth.currentUser.uid,
        "userFollowing",
        props.route.params.uid
      ),
      {}
    );
  };

  const onUnfollow = () => {
    deleteDoc(
      doc(
        db,
        "following",
        auth.currentUser.uid,
        "userFollowing",
        props.route.params.uid
      ),
      {}
    );
  };

  if (user == null) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>

        {props.route.params.uid !== auth.currentUser.uid ? (
          <View>
            {following ? (
              <Button
                title="Following"
                onPress={() => {
                  onUnfollow();
                }}
              />
            ) : (
              <Button
                title="Follow"
                onPress={() => {
                  onFollow();
                }}
              ></Button>
            )}
          </View>
        ) : null}
      </View>

      <View style={styles.containerGallery}>
        <FlatList
          numColumns={3}
          horizontal={false}
          data={userPost}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <Image style={styles.image} source={{ uri: item.downloadURL }} />
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  containerInfo: {
    margin: 20,
  },
  containerGallery: {
    flex: 1,
  },
  containerImage: {
    flex: 1 / 3,
  },
  image: {
    flex: 1,
    aspectRatio: 1 / 1,
  },
});

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  posts: store.userState.posts,
  following: store.userState.following,
});

export default connect(mapStateToProps, null)(Profile);
