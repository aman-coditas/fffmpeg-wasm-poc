import React, { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ImageToVideo from './TabViews/ImageToVideo/ImageToVideo';
import 'react-tabs/style/react-tabs.css';
import './bootstrap.min.css';
import CanvasToVideo from "./TabViews/CanvasToVideo/CanvasToVideo";
import SvgToVideo from "./TabViews/SvgToVideo/SvgToVideo";

function App() {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
      <TabList>
        <Tab>Image To Video</Tab>
        <Tab>Canvas to Video</Tab>
        <Tab>SVG to Video</Tab>
      </TabList>

      <TabPanel>
        <ImageToVideo />
      </TabPanel>
      <TabPanel>
        <CanvasToVideo  />
      </TabPanel>
      <TabPanel>
        <SvgToVideo  />
      </TabPanel>
    </Tabs>
  );
}

export default App;
