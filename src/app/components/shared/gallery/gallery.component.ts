import { Component, OnInit, Input, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';
import { AuthenticationService } from '../../../services/authentication.service';
import Swal from 'sweetalert2'
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  user: any = undefined;
  uploader: FileUploader;
  uploadimageDetails: any = {};
  showImagePlaceholder: boolean = false;
  imageLarge: string = "";
  constructor(
    private cloudinary: Cloudinary,
    private zone: NgZone,
    private http: HttpClient,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    // this.user = JSON.parse(localStorage.getItem("userInfo"));
    this.getUserInfo();

    const uploaderOptions: FileUploaderOptions = {
      url: `https://api.cloudinary.com/v1_1/${this.cloudinary.config().cloud_name}/upload`,
      // Upload files automatically upon addition to upload queue
      autoUpload: true,
      // Use xhrTransport in favor of iframeTransport
      isHTML5: true,
      // Calculate progress independently for each uploaded file
      removeAfterUpload: true,
      // XHR request headers
      headers: [
        {
          name: 'X-Requested-With',
          value: 'XMLHttpRequest'
        }
      ]
    };
    this.uploader = new FileUploader(uploaderOptions);

    this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      // Add Cloudinary's unsigned upload preset to the upload form
      form.append('upload_preset', this.cloudinary.config().upload_preset);
      // Add file to upload
      form.append('file', fileItem);
      // Use default "withCredentials" value for CORS requests
      fileItem.withCredentials = false;
      return { fileItem, form };
    };

    this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) => {
      var uploadImageResponse = JSON.parse(response);
      // console.log("uploadImageResponse: ", uploadImageResponse);
      this.uploadimageDetails = uploadImageResponse;
      // send upload response like public id and url to api
      this.uploadedImageDetailsSend(uploadImageResponse);
    }
    this.uploader.onCompleteAll = () => {
      Swal({
        type: 'success',
        title: 'Success',
        text: 'Images added successfully in gallery.!',
      });
    }
  }

  uploadedImageDetailsSend(imageUploadedDetails) {
    var id = JSON.parse(localStorage.getItem("userInfo"))._id;
    var token = localStorage.token;
    var images = [];
    var oldGallery = this.user.gallery;
    if (oldGallery.length > 0) {
      images = oldGallery;
    }
    images.push(imageUploadedDetails.public_id)
    this.authService.saveGalleryImages(id, token, images).subscribe(result => {
      // console.log("result", result);
      if (result == true) {
        this.getUserInfo();
      }
    }, err => {
      // console.log("err", err);
      Swal({
        type: 'error',
        title: 'Oops...',
        text: 'Sorry unable to process your request. Please try again.!',
      });
    });
  }

  getUserInfo() {
    var token = localStorage.getItem("token");
    var username = localStorage.getItem("username");
    // get user info
    this.authService.getUserInfo(username, token).subscribe(result => {
      var response = JSON.parse(result._body);
      this.user = response;
      this.user.gallery = this.user.gallery.filter(i => i != null);
      localStorage.setItem("userInfo", result._body);
      // console.log("User info", response);
    }, err => {
      // console.log("err", err);
      // alert("Unable to retrieve your information from server.");
    });
  }

  deleteImageFromGallery(publicid) {
    // console.log(this.user.gallery);
    this.showImagePlaceholder = false;
    var deletedImage = this.user.gallery.splice(this.user.gallery.indexOf(publicid), 1);
    var filteredArray = this.user.gallery.filter(e => { return e });
    this.user.gallery = filteredArray;
    // console.log(this.user.gallery);
    console.log("deleted image public id", publicid);
    // delete image from database
    this.uploadedImageDetailsSend(filteredArray);
    Swal({
      type: 'success',
      title: 'Success',
      text: 'Image deleted successfully.!',
    });
    // to delete image from cloud server we need to have another api to delete 
    // image from cloud server as we cannot delete image on cloudinary server from client side
  }

}
