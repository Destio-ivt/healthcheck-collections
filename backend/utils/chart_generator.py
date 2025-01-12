import matplotlib
from matplotlib import pyplot as plt
import locale
import numpy as np

matplotlib.use('Agg')  # Non-GUI backend for matplotlib
locale.setlocale(locale.LC_ALL, '')  # Set locale for number formatting

def wrap_text(text, max_words=7):
    """Wrap text to a new line after a specified number of words."""
    words = text.split()
    return '\n'.join([' '.join(words[i:i+max_words]) for i in range(0, len(words), max_words)])

def create_chart(df, config, output_path, subtitle):
    """
    Creates a pie or bar chart and saves it to the specified path.

    Args:
        df (pd.DataFrame): DataFrame with labels in the first column and values in the second column.
        config (dict): Chart configuration including type, colors, title, and sorting options.
        output_path (str): Path to save the chart.
        subtitle (str): Subtitle to display on the chart.

    Returns:
        dict: Success or error message in JSON format.
    """
    try:
        # Configuration defaults
        chart_type = config.get("chart_type", "bar")
        title = config.get("title", "Chart")
        bar_color = config.get("bar_color", "#46bdc6")
        pie_colors = config.get("pie_colors", plt.cm.Paired.colors)
        sort_desc = config.get("sort_desc", False)

        # Validate data
        if df.empty or df.shape[1] < 2:
            return {"error": "DataFrame must have at least two columns (labels and values)."}

        # Preprocess data
        df = df.dropna()
        if sort_desc:
            df = df.sort_values(by=df.columns[1], ascending=False)

        # Wrap long text labels
        df.iloc[:, 0] = df.iloc[:, 0].apply(wrap_text)

        # Chart figure setup
        fig, ax = plt.subplots(figsize=(12, max(6, len(df) * 0.8)))
        fig.subplots_adjust(left=0.15, right=0.85, top=0.85, bottom=0.2)  # Add margins for each side

        # Title and subtitle setup
        fig.text(0.5, 0.95, title, fontsize=18, fontweight="bold", ha="center")
        fig.text(0.5, 0.92, subtitle, fontsize=12, color="gray", ha="center")

        if chart_type == "pie":
            total = df.iloc[:, 1].sum()
            ax.pie(
                df.iloc[:, 1],
                labels=df.iloc[:, 0],
                colors=pie_colors,
                autopct=lambda p: f"{p:.1f}%\n({locale.format_string('%d', int(round(p * total / 100)), grouping=True)})",
                startangle=90,
                wedgeprops={"edgecolor": "w"},
                textprops={"fontsize": 10, "color": "black"}
            )
            ax.set_aspect('equal', adjustable='box')  # Ensure pie chart looks proportionate
        elif chart_type == "bar":
            # Apply log scaling to avoid drastic bar length differences 
            values = df.iloc[:, 1]
            scaled_values = np.log1p(values)
            max_value = scaled_values.max()
            min_value = scaled_values.min()
            normalized_values = 1 + (scaled_values - min_value) / (max_value - min_value) * 100

            bars = ax.barh(df.iloc[:, 0], normalized_values, color=bar_color, edgecolor="black")
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)

            for bar, original_value in zip(bars, values):
                ax.text(
                    bar.get_width() + 1,
                    bar.get_y() + bar.get_height() / 2,  # Adjust the value position slightly away from the bar
                    locale.format_string("%d", int(original_value), grouping=True),
                    va="center", fontsize=10, color="black"
                )

            ax.set_ylim(-0.5, len(df) - 0.5)  # Ensure bars fit without overlap
            ax.xaxis.set_visible(False)  # Hide x-axis labels and scale
        else:
            return {"error": f"Unsupported chart type: '{chart_type}'"}

        # Save the chart aku titipkan dia tak pantas ku bersanding dengan nya bahagiakan dia kau sayangi dia sepertiku menyayanginya dann kan ku ikhlaskan dia 
        plt.savefig(output_path, bbox_inches="tight", dpi=300)
        return {"message": f"Chart successfully saved at {output_path}"}
    except Exception as e:
        return {"error": f"Error creating chart: {str(e)}"}
    finally:
        plt.close()
