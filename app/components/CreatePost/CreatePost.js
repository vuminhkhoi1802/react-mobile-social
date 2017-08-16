// - Import react components
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import uuid from 'uuid'
import _ from 'lodash'
import { connect } from 'react-redux'
import { View, ScrollView, TextInput, Text, Image, TouchableOpacity, Keyboard, KeyboardAvoidingView } from 'react-native';
import moment from 'moment'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { changeData, dbLogin } from './../../actions'
import { Card, CardSection, Input, Button, Spinner } from './../../layouts'
import * as Animatable from 'react-native-animatable'
import ImagePicker from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'

// - Import component styles 
import styles from './styles'

// - Import app API
import * as FileAPI from '../../api/FileAPI'

// - Import app components
import CommentList from './../CommentList'
import Img from './../Img'
import Avatar from './../Avatar'

// - Import actions
import * as imageGalleryActions from '../../actions/imageGalleryActions'

/**
 * Create component class
 * 
 * @export
 * @class Login
 * @extends {Component}
 */
export class CreatePost extends Component {


  /**
   * Navigation options
   * 
   * @static
   * @memberof CreatePost
   */
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    const { navigate } = navigation
    return {
      title: 'Create Post',
      headerTintColor: "#616161",
      headerStyle: {
        backgroundColor: "#ffffff"
      },
      headerRight: (<TouchableOpacity onPress={() => params.handleSavePost()}><Icon name="create" color={params.enableSavePost ? '#000000' : '#eeeeee'} size={20} style={{ marginRight: 10 }} /></TouchableOpacity>)
    }
  }


  /**
   * Creates an instance of CreatePost.
   * @param {any} props 
   * @memberof CreatePost
   */
  constructor(props) {
    super(props)

    this.state = {
      text: '',
      keyboardVisible: false,
      imageSource: null,
      imageHeight: 0,
      imageWidth: 0,
      imageName:''
    }

  }

  /**
   * Save a post
   * 
   * @memberof CreatePost
   */
  savePost = () => {
    this.uploadImage()
  }

  /**
   * On Changing input text
   * 
   * @memberof CreatePost
   */
  changeText = (text) => {
    const { navigation } = this.props
    navigation.setParams({ enableSavePost: false })
    this.setState({
      text: text
    })

    navigation.setParams({ enableSavePost: (_.trim(text) !== '') })

  }

  /**
   * Delete post image
   * 
   * @memberof CreatePost
   */
  deleteImage = () => {
    this.setState({
      imageSource: null,
      imageHeight: 0,
      imageWidth:0,
      imageName:''
    })
  }

  /**
   * Fire when keboard will be shown
   * 
   * @memberof CreatePost
   */
  keyboardWillShow = (event) => {
    this.setState({
      keyboardVisible: true
    })
  }

  /**
   * Fire when keyboard will be hidden
   * 
   * @memberof CreatePost
   */
  keyboardWillHide = (event) => {
    this.setState({
      keyboardVisible: false
    })


  }

  uploadImage = () => {

    const {imageHeight, imageWidth, imageName, imageSource, saveImage} = this.state

    if(imageSource===null)
      return

    let max_size = 986;
    let width = imageWidth
    let height = imageHeight
    if (width > height) {
      if (width > max_size) {
        height *= max_size / width
        width = max_size;
      }
    } else {
      if (height > max_size) {
        width *= max_size / height
        height = max_size
      }
    }


    ImageResizer.createResizedImage(imageSource, width, height, 'JPEG', 80).then((response) => {
      
      const extension = FileAPI.getExtension(response.name)
      const fileName = (`${uuid()}.${extension}`)

      saveImage(response.uri,fileName)
      // response.uri is the URI of the new image that can now be displayed, uploaded...
      // response.path is the path of the new image
      // response.name is the name of the new image with the extension
      // response.size is the size of the new image
    }).catch((err) => {
      // Oops, something went wrong. Check that the filename is correct and
      // inspect err to get more details.
    })

  }

  showGallery = () => {

    // More info on all the options is below in the README...just some common use cases shown here
    var options = {
      title: 'Select an Image',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };


    /**
 * The first arg is the options object for customization (it can also be null or omitted for default options),
 * The second arg is the callback which sends object: response (more info below in README)
 */
    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        let source = { uri: response.uri };

        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          imageSource: source,
          imageHeight: response.height,
          imageWidth: response.width,
          imageName: response.fileName
        });
      }
    });
  }

  componentWillMount() {
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove()
    this.keyboardWillHideSub.remove()
  }
  componentDidMount() {
    const { navigation } = this.props
    navigation.setParams({ handleSavePost: this.savePost })
    navigation.setParams({ enableSavePost: false })
  }

  render() {
    const { avatar, name, banner, windowSize } = this.props
    const { keyboardVisible, imageSource, imageHeight } = this.state



    return (

      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
      >
        <ScrollView>
          <Card>
            <View style={{ flexDirection: 'row', padding: 8 }}>
              <Avatar size="30" name={name || ' '} fileName={avatar} />
              <View style={{ display: 'flex', flex: 1, flexDirection: 'column', marginLeft: 10, paddingTop: 5, paddingBottom: 5 }}>
                <Text style={{}}>{name}</Text>
              </View>
            </View>
            <View>
              <TextInput
                style={styles.input}
                multiline={true}
                numberOfLines={4}
                onChangeText={this.changeText}
                onSubmitEditing={Keyboard.dismiss}
                value={this.state.text}
                placeholder='What is new with you?'
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => this.showGallery()}>
                <Icon name="photo-camera" size={20} style={{ color: '#757575', margin: 7, backgroundColor: "transparent" }} onPress={this.showGallery} />
              </TouchableOpacity>
              {keyboardVisible ? (<TouchableOpacity activeOpacity={0.7} onPress={() => Keyboard.dismiss()}>
                <Icon name="keyboard-hide" size={20} style={{ color: '#757575', margin: 7, backgroundColor: "transparent" }} onPress={this.loginWithFacebook} />
              </TouchableOpacity>) : <Text></Text>}
            </View>
            {imageHeight > 0 ? (<View>
              <TouchableOpacity style={{ backgroundColor: '#eeeeee', borderRadius: (24 * 0.5), width: 24, height: 24, position: 'absolute', zIndex: 5, top: 3, right: 3 }} activeOpacity={0.7} onPress={() => navigate('CreatePost')}>
                <Icon name="remove-circle" size={20} style={{ color: '#757575', margin: 2, backgroundColor: "transparent" }} onPress={this.deleteImage} />
              </TouchableOpacity>
              <Image style={{ width: null, height: imageHeight < 380 ? imageHeight : 380 }} source={imageSource} />
            </View>) : <Text></Text>}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

    )
  }
}

/**
 * Map dispatch to props
 * @param  {func} dispatch is the function to dispatch action to reducers
 * @param  {object} ownProps is the props belong to component
 * @return {object}          props of component
 */
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    saveImage: (file, fileName) => {
      dispatch(imageGalleryActions.dbUploadImage(file, fileName))
    },
    deleteImage: (id) => {
      dispatch(imageGalleryActions.dbDeleteImage(id))
    }

  }
}

/**
 * Map state to props
 * @param  {object} state is the obeject from redux store
 * @param  {object} ownProps is the props belong to component
 * @return {object}          props of component
 */
const mapStateToProps = (state, ownProps) => {
  const { uid } = state.authorize
  const { windowSize } = state.global
  return {
    avatar: state.user.info && state.user.info[uid] ? state.user.info[uid].avatar || '' : '',
    name: state.user.info && state.user.info[uid] ? state.user.info[uid].fullName || '' : '',
    banner: state.user.info && state.user.info[uid] ? state.user.info[uid].banner || '' : '',
    posts: state.post.userPosts ? state.post.userPosts[uid] : {},
    uid,
    windowSize

  }
}

/**
 * Connect component to redux store
 */
export default connect(mapStateToProps, mapDispatchToProps)(CreatePost)
