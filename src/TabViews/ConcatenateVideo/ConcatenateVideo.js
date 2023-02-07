import { useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";


function ConcatenateVideo(){
    const [videoList, setVideoList] = useState(["https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/op/04ac4d9f-acd9-4b0f-80ec-e09bc587d8df/5ae49d1f-2610-4c3e-87b8-cd8cc241ef5e/426x240/part_10.mp4","https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/op/04ac4d9f-acd9-4b0f-80ec-e09bc587d8df/5ae49d1f-2610-4c3e-87b8-cd8cc241ef5e/426x240/part_11.mp4", "https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/op/04ac4d9f-acd9-4b0f-80ec-e09bc587d8df/5ae49d1f-2610-4c3e-87b8-cd8cc241ef5e/426x240/part_12.mp4", "https://dev-vv-hotstar-output.s3.ap-northeast-1.amazonaws.com/op/04ac4d9f-acd9-4b0f-80ec-e09bc587d8df/5ae49d1f-2610-4c3e-87b8-cd8cc241ef5e/426x240/part_13.mp4"]);
    const [message, setMessage] = useState("Click Start to transcode");
    const [videoUrl,setVideoUrl]=useState('')
    console.log("videoList",videoList)


    const ffmpeg = createFFmpeg({
        corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
        log: true
      });



async function concVideo(){
 // loading FFMPEG core
    await ffmpeg.load();
       
    setMessage("Start Concat")
        
    const inputPaths = [];
        
    for (let i=0;i<=videoList.length;i+=1) {
        ffmpeg.FS('writeFile', `test-${i}`, await fetchFile(videoList[i]));
        inputPaths.push(`file test-${i}`);
      }
    ffmpeg.FS('writeFile', 'concat_list.txt', inputPaths.join('\n'));

    await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', "-c", "copy", 'output.mp4');

    setMessage("Complete Concat");

    const data = ffmpeg.FS('readFile', 'output.mp4');

 const blob = new Blob([data.buffer], { type: "video/mp4" });
  const file = await fetch(blob).then(blobFile => new File([blobFile], `filename`, { type: "video/mp4" }));

    console.log('file: ', file);
    setVideoUrl(URL.createObjectURL(blob))
  };

return(
    <div style={{display:'flex',flexDirection:'column',rowGap:'20px',margin:'24px'}}>
        <video style={{height:'300px',width:'300px'}} src={videoUrl} controls/>
        <button style={{width:'120px'}} onClick={concVideo}>Start</button>
    </div>
) 
}
export default ConcatenateVideo