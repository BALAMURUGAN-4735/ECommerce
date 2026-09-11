package snippet;

public class Snippet {
	<dependencyManagement>
	    <dependencies>
	        <dependency>  <!-- 🟢 CHANGED TO DEPENDENCY -->
	            <groupId>org.springframework.cloud</groupId>
	            <artifactId>spring-cloud-dependencies</artifactId>
	            <version>${spring-cloud.version}</version>
	            <type>pom</type>
	            <scope>import</scope>
	        </dependency> <!-- 🟢 CHANGED TO DEPENDENCY -->
	    </dependencies>
	</dependencyManagement>
}

