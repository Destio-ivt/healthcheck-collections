import matplotlib.pyplot as plt

# Chart settings
CHART_CONFIG = {
    "2_req-resp": {
        "title": "Request and Response",
        "chart_type": "pie",
        "sort_desc": False,
        "bar_color": None,
        "pie_colors": ["#46bdc6", "#ff9900"],
    },
    "3_auth-resp": {
        "title": "Auth Response Count",
        "chart_type": "bar",
        "sort_desc": False,
        "bar_color": "#46bdc6",
    },
    "5_req-paths": {
        "title": "Top 5 Endpoints",
        "chart_type": "bar",
        "sort_desc": True,
        "bar_color": "#46bdc6",
    },
    "6_error-count": {
        "title": "Error Count",
        "chart_type": "bar",
        "sort_desc": True,
        "bar_color": "#ff9900",
    },
    "7_remote-addr-count": {
        "title": "Remote Access Count",
        "chart_type": "bar",
        "sort_desc": False,
        "bar_color": "#46bdc6",
    },
    # Add other chart configurations as needed
}
# Matplotlib settings
plt.rcParams["axes.titlesize"] = 14
plt.rcParams["axes.labelsize"] = 12
plt.rcParams["xtick.labelsize"] = 10
plt.rcParams["ytick.labelsize"] = 10
