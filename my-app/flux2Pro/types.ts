export interface FluxClient {
  url: string;
  apiKey: string;
  model: string;
}

export interface FluxRespons {
  created: number;
  data: [{
    b64_json: string;
  }];
  request_meta: {
    cost: number;
    input_np: number;
    output_np: number;
    total_pixels: number;
  };
}

export interface FluxBody {
  prompt: string;
  width: string;
  seed: number;
  height: string;
  disable_pup: boolean;
  output_format: "png" | "jpeg";
  input_image?: string;
  input_image_2?: string;
  input_image_3?: string;
  input_image_4?: string;
  input_image_5?: string;
  input_image_6?: string;
  input_image_7?: string;
  input_image_8?: string;  
}