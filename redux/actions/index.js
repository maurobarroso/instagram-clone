import {
  USER_POSTS_STATE_CHANGE,
  USER_STATE_CHANGE,
  USER_FOLLOWING_STATE_CHANGE,
  USERS_DATA_STATE_CHANGE,
} from "../constants/index";
import {
  getDoc,
  doc,
  collection,
  getDocs,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import db from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

// Queda pendiente ver porque getState no esta definido

// Fetching de los usuarios
export function fetchUser() {
  return (dispatch) => {
    const auth = getAuth();

    const docRef = doc(db, "users", auth.currentUser.uid);

    getDoc(docRef)
      .then((snapshot) => {
        if (snapshot.exists) {
          // Aca verificamos si tenemos al usuario logueado
          dispatch({ type: USER_STATE_CHANGE, currentUser: snapshot.data() });
        } else {
          console.log("does not exist");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
}

// Fetching de los posts de manera ascendente
export function fetchUserPosts() {
  return (dispatch) => {
    const auth = getAuth();
    const myDocument = doc(db, "posts", auth.currentUser.uid);
    const docRef = query(
      collection(myDocument, "userPosts"),
      orderBy("creation", "asc")
    );

    getDocs(docRef)
      .then((snapshot) => {
        let posts = snapshot.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;

          return { id, ...data };
        });

        dispatch({ type: USER_POSTS_STATE_CHANGE, posts });
      })
      .catch((err) => {
        console.log(err);
      });
  };
}

// Fetching de los usuarios seguidos
export function fetchUserFollowing() {
  return (dispatch) => {
    const auth = getAuth();
    const myDocument = doc(db, "following", auth.currentUser.uid);
    const docRef = collection(myDocument, "userFollowing");

    console.log(docRef.path);

    onSnapshot(docRef, (snapshot) => {
      let following = snapshot.docs.map((doc) => {
        const id = doc.id;

        return id;
      });
      dispatch({ type: USER_FOLLOWING_STATE_CHANGE, following });

      for (let i = 0; i < following.length; i++) {
        dispatch(fetchUsersData(following[i]));
      }
    });
  };
}

export function fetchUsersData(uid) {
  return (dispatch, getState) => {
    const found = getState().usersState.users.some((el) => el.uid == uid);

    if (!found) {
      const docRef = doc(db, "users", uid);

      getDoc(docRef)
        .then((snapshot) => {
          if (snapshot.exists) {
            let user = snapshot.data();
            user.uid = snapshot.id;

            dispatch({
              type: USERS_DATA_STATE_CHANGE,
              user,
            });

            dispatch(fetchUserFollowingPosts(user.id));
          } else {
            console.log("does not exist");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

export function fetchUserFollowingPosts(uid) {
  return (dispatch, getState) => {
    const myDocument = doc(db, "posts", uid);
    const docRef = query(
      collection(myDocument, "userPosts"),
      orderBy("creation", "asc")
    );

    getDocs(docRef)
      .then((snapshot) => {
        const uid = snapshot.query.EP.path.segments[1];
        console.log({ snapshot, uid });
        const user = getState().usersState.users.find((el) => el.uid == uid);

        let posts = snapshot.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;

          return { id, ...data, user };
        });
        console.log(posts);
        dispatch({ type: USERS_POSTS_STATE_CHANGE, posts });
        console.log(getState());
      })
      .catch((err) => {
        console.log(err);
      });
  };
}
