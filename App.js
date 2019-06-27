/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  NativeModules,
  TouchableOpacity,
  Image,
  Button
} from "react-native";
import NetworkState, { Settings } from "react-native-network-state";
var ImagePicker = NativeModules.ImageCropPicker;

type Props = {};
export default class App extends Component<Props> {
  constructor() {
    super();
    this.state = {
      image: null,
      netState: "",
      loading: true,
      carprJson: { alpr: "" }
    };
  }

  pickSingleWithCamera(cropping, mediaType = "photo") {
    ImagePicker.openCamera({
      cropping: cropping,
      width: 500,
      height: 200,
      includeExif: true,
      mediaType
    })
      .then(image => {
        console.log("received image", image);
        this.setState({
          image: {
            uri: image.path,
            width: image.width,
            height: image.height,
            mime: image.mime
          }
        });

        var photo = {
          uri: image.path,
          type: image.mime,
          name: image.path.replace(/^.*[\\\/]/, "")
        };
        console.log("received photo", photo);
        const data = new FormData();
        data.append("file", photo);
        fetch("http://14.63.106.109:28080/alpr/uploadFile", {
          method: "post",
          body: data
        })
          .then(response => response.json())
          .then(responseJson => {
            console.log(responseJson);
            this.setState({
              loading: false,
              carprJson: responseJson
            });
          })
          .catch(error => console.log(error)); //to catch the errors if any
      })
      .catch(e => alert(e));
  }

  renderAsset(image) {
    if (image.mime && image.mime.toLowerCase().indexOf("video/") !== -1) {
      return <Text>이미지가 아닙니다.</Text>;
    }
    return this.renderImage(image);
  }

  renderImage(image) {
    return (
      <Image
        style={{ width: 300, height: 300, resizeMode: "contain" }}
        source={image}
      />
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <NetworkState
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
          onConnected={() =>
            this.setState({
              netState: "네트워크가 활성화 되어있습니다."
            })
          }
          onDisconnected={() =>
            this.setState({
              netState: "네트워크가 활성화가 필요합니다."
            })
          }
        />
        <Text style={styles.text}>{this.state.netState}</Text>
        <ScrollView>
          {this.state.image ? this.renderAsset(this.state.image) : null}
        </ScrollView>
        <Text style={styles.text}>{this.state.carprJson.alpr}</Text>
        <Button
          onPress={() => this.pickSingleWithCamera(true)}
          style={styles.button}
          title="차량 번호판 사진을 찍어 주세요."
          color="#841584"
          accessibilityLabel="차량 번호판 사진을 찍어 주세요."
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red"
  },
  button: {
    backgroundColor: "blue",
    marginBottom: 10
  },
  text: {
    color: "white",
    fontSize: 20,
    textAlign: "center"
  }
});
