import { v2 } from 'cloudinary';
import { CLOUDINARY } from '../constant/cloundinary';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    return v2.config({
      cloud_name: 'dbglvjsap',
      api_key: '741117134798858',
      api_secret: 'PcAMxBD39fnS71Y-mqteKWc59zM',
    });
  },
};