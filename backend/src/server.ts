import app from "./index";
import { config } from "./config/env";

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
