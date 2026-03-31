import "dotenv/config";
import { createApp } from "./app.ts";

const port = 3001;
const app = createApp();

app.listen(port, () => console.log(`Server running on port ${port}`));