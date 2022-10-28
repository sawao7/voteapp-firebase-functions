import FilePreviewer from "react-file-previewer";
// Core viewer
import { Viewer } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";
import classes from "styles/Index.module.css";

// Pluginsn
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Create new plugin instance
// const defaultLayoutPluginInstance = defaultLayoutPlugin(
//     props?: DefaultLayoutPluginProps
// );

import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";

// Import styles
import "@react-pdf-viewer/thumbnail/lib/styles/index.css";

// const thumbnailPluginInstance = thumbnailPlugin(PageThumbnail: <Cover getPageIndex={() => 0} />);

const Previews = (props) => {
	const url = props.url;
	return (
		<div className={classes.viewer}>
			<Worker workerUrl="https://unpkg.com/pdfjs-dist@2.12.313/build/pdf.worker.min.js">
				<Viewer fileUrl={url} />
			</Worker>
		</div>
	);
};

export default Previews;
