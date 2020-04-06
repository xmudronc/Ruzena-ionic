import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { File } from '@ionic-native/file/ngx';
import { Device } from '@ionic-native/device/ngx';
import * as fp from '../../assets/fixedpalette/js/fixedpalette';
import * as $ from '../../assets/fixedpalette/js/jquery-2.0.3.min';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private camera: Camera,
    private base64: Base64,
    private file: File,
    private device: Device
  ) {
  }

  private csv: String;
  private imgRes: any;
  private options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }

  ngOnInit() {
    $.ajax({
      type: "GET",
      url: "/assets/fixedpalette/palette.csv",
      dataType: "text",
      success: function(data) {
        this.csv = data;
      },
      error: function(err) {
        console.log(err);
      }
    });
  }

  onCamera() {    
    this.camera.getPicture(this.options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.base64.encodeFile(imageData).then((base64File: string) => {
        fp.fun(this.csv, base64File).then(back => {
          console.log(back);
        }).catch(err => {
          console.error(err);
        });
      }, (err) => {
        console.error(err);
      });
     }, (err) => {
      console.error(err);
     });
  }

}
