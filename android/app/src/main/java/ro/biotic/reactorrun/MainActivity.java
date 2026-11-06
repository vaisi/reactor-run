package ro.biotic.reactorrun;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Draw behind the system bars; Capacitor's SystemBars passes the insets to the page as --safe-area-inset-* (see capacitor.config.json)
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
        // The HUD is laid out to the pixel, so the phone's font-size setting should not rescale it
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null) webView.getSettings().setTextZoom(100);
        }
    }
}
